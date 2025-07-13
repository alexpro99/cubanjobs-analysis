import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelConfiguration } from './entities/channel-configurations.entity';
import { DataSource, Repository } from 'typeorm';
import { TelegramControlService } from 'src/telegram-control/telegram-control.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { LlmService } from 'src/llm/llm.service';
import { CachedMessage } from './entities/cached-messages.entity';
@Injectable()
export class ChannelDataExtractionService implements OnModuleInit {
  private readonly logger = new Logger(ChannelDataExtractionService.name);

  constructor(
    @InjectRepository(ChannelConfiguration)
    private channelConfigRepository: Repository<ChannelConfiguration>,
    @InjectRepository(CachedMessage)
    private cachedMessageRepository: Repository<CachedMessage>,
    private telegramControlService: TelegramControlService,
    private schedulerRegistry: SchedulerRegistry,
    private readonly llmService: LlmService,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    this.logger.log('Inicializando ExtractionService...');
    await this.configureChannels();
  }

  async configureChannels() {
    this.logger.log('Configurando canales...');
    const channels = await this.channelConfigRepository.find({
      where: { disabled: false },
    });
    this.logger.log(
      `Canales para procesar: ${channels.map((c) => c.channelName).join(', ') || 'Ninguno'}`,
    );

    for (const channel of channels) {
      if (channel.disabled) continue;
      this.logger.log(`Configurando canal: ${channel.channelName}`);
      this.createCronJobExtractMessages(channel);

      if (!channel.disableAnalysis) this.createCronJobDataExtraction(channel);
    }
  }

  private createCronJob(
    name: string,
    cronFrequency: number,
    jobCallback: () => Promise<void>,
  ) {
    const cronExpression = `0 */${cronFrequency} * * * *`;
    const job = new CronJob<null, null>(cronExpression, async () => {
      try {
        await jobCallback();
      } catch (error) {
        this.logger.error(
          `Error ejecutando job ${name}: ${error.message}`,
          error.stack,
        );
      }
    });

    this.schedulerRegistry.addCronJob(name, job);
    this.logger.log(
      `Job ${name} programado para ejecutarse con la expresión: ${cronExpression}`,
    );
    this.schedulerRegistry.getCronJob(name).start();
  }

  private createCronJobExtractMessages(channel: ChannelConfiguration) {
    const { channelName, extractionFrequency, messagesPerExtraction, id } =
      channel;
    const scheduleName = `${channelName}-extraction`;

    this.createCronJob(scheduleName, extractionFrequency, async () => {
      this.logger.log(`Ejecutando job para el canal: ${channelName}`);
      await this.telegramControlService.extractAndProcessMessages(
        channelName,
        messagesPerExtraction,
        id,
      );
    });
  }

  private createCronJobDataExtraction(channel: ChannelConfiguration) {
    const {
      messagesAnalysisFrequency,
      messageAnalysisBatchSize,
      extractionPrompt,
      channelName,
      id,
    } = channel;

    if (
      !messagesAnalysisFrequency ||
      !messageAnalysisBatchSize ||
      !extractionPrompt
    ) {
      this.logger.warn(
        `No se ha configurado la extracción de datos para el canal ${channelName}.  Saltando creación de cron.`,
      );
      return;
    }

    const scheduleName = `${channelName}-data-extraction`;

    this.createCronJob(scheduleName, messagesAnalysisFrequency, async () => {
      this.logger.log(
        `Ejecutando job de extracción de datos para el canal: ${channelName}`,
      );
      const cachedMessages = await this.cachedMessageRepository.find({
        where: { isProcessed: false, channel: { id } },
        take: messageAnalysisBatchSize,
        order: { touchedTimes: 'ASC', timestamp: 'ASC' },
      });

      await Promise.all(
        cachedMessages.map(async (message) => {
          message.touchedTimes += 1;
          await this.cachedMessageRepository.save(message);
        }),
      );

      if (cachedMessages && cachedMessages.length > 0) {
        await this.extractInformationFromUnstructuredText(
          cachedMessages,
          extractionPrompt,
          channel.id,
        );
      } else {
        this.logger.log(
          `No se encontraron mensajes nuevos para el canal ${channelName}.`,
        );
      }
    });
  }

  private async extractInformationFromUnstructuredText(
    messages: CachedMessage[],
    extractionPrompt: string,
    channelId: string,
  ) {
    const channelConfig = await this.channelConfigRepository.findOne({
      where: { id: channelId },
    });

    if (!channelConfig || !channelConfig.targetEntity) {
      this.logger.error(
        `El canal con id ${channelId} no tiene una targetEntity configurada.`,
      );
      return;
    }

    const mappedMessages = messages
      .map((message, i) => {
        return `Oferta ${i + 1}
                    
                    ${message.content}
                    Publicado: ${message.timestamp.toDateString()}
                    Por: ${JSON.stringify(message.authorId)}
                    oferta_id: ${message.messageId}
        
                    `;
      })
      .join('');

    const llmPriorityOrder = process.env['LLM_PROVIDER_ORDER']?.split(' ');

    const { extractedInformation, modelName } =
      await this.llmService.extractInformationFromText(
        mappedMessages,
        extractionPrompt,
        llmPriorityOrder,
      );

    if (
      !extractedInformation ||
      !Array.isArray(extractedInformation['ofertas']) ||
      extractedInformation['ofertas'].length === 0
    ) {
      this.logger.warn(
        `No se extrajo información válida o el array de ofertas está vacío para el canal ${channelId}.`,
      );
      return;
    }

    this.logger.log(
      `Información extraída para ${channelConfig.channelName}: ${JSON.stringify(extractedInformation, null, 2)}`,
    );

    const targetRepository = this.getTargetRepository(
      channelConfig.targetEntity,
    );

    await Promise.all(
      extractedInformation['ofertas'].map(async (info: any) => {
        try {
          const newEntry = targetRepository.create({
            ...info,
            extractedWith: modelName,
          });

          await this.cachedMessageRepository.update(
            { messageId: info.oferta_id, channel: { id: channelId } },
            { isProcessed: true },
          );

          await targetRepository.save(newEntry);
        } catch (error) {
          this.logger.error(
            `Error guardando la información en la entidad ${channelConfig.targetEntity}: ${error.message}`,
            error.stack,
          );
        }
      }),
    );
  }

  // Método helper para obtener repositorio con validación ej targetEntity: CubanJobs
  private getTargetRepository(targetEntity: string): Repository<any> {
    try {
      return this.dataSource.getRepository(targetEntity);
    } catch (error) {
      this.logger.error(
        `Error obteniendo repositorio para entidad ${targetEntity}: ${error.message}`,
      );
      throw error;
    }
  }

  // Opcional: Permite eliminar un job dinámicamente (ej: al modificar la configuración del canal)
  deleteCron(name: string) {
    this.schedulerRegistry.deleteCronJob(name);
    this.logger.warn(`Job ${name} eliminado!`);
  }
}
