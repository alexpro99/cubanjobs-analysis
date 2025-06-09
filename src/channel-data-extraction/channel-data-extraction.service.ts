import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelConfiguration } from './entities/channel-configurations.entity';
import { Repository } from 'typeorm';
import { TelegramControlService } from 'src/telegram-control/telegram-control.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
@Injectable()
export class ChannelDataExtractionService implements OnModuleInit {

    private readonly logger = new Logger(ChannelDataExtractionService.name);

    constructor(
        @InjectRepository(ChannelConfiguration)
        private channelConfigRepository: Repository<ChannelConfiguration>,
        private telegramControlService: TelegramControlService,
        private schedulerRegistry: SchedulerRegistry,

    ) {

    }

    async onModuleInit() {
        this.logger.log('Inicializando ExtractionService...');
        await this.configureChannels();
    }

    async configureChannels() {
        this.logger.log('Configurando canales...');
        const channels = await this.channelConfigRepository.find();

        for (const channel of channels) {
            this.logger.log(`Configurando canal: ${channel.channelName}`);
            this.createCronJob(channel);
        }
    }



    private createCronJob(channel: ChannelConfiguration) {
        const { channelName, extractionFrequency, messagesPerExtraction, extractionPrompt, id } = channel;

        // Calcular la expresión cron en base a la frecuencia (extractionFrequency).
        // Por ejemplo, si extractionFrequency es 5, la expresión cron será '0 */5 * * * *' (cada 5 minutos)
        const cronExpression = `0 */${extractionFrequency} * * * *`; // Segundo, Minuto, Hora, Día del mes, Mes, Día de la semana

        const job = new CronJob<null, null>(cronExpression, async () => {
            this.logger.log(`Ejecutando job para el canal: ${channelName}`);
            try {
                // Llama al TelegramService para extraer los mensajes
                await this.telegramControlService.extractAndProcessMessages(
                    channelName,
                    messagesPerExtraction,
                    extractionPrompt,
                    id, // Pasamos el ID del canal para actualizar lastExtractedMessageId
                );
            } catch (error) {
                this.logger.error(`Error al ejecutar el job para el canal ${channelName}: ${error.message}`, error.stack);
            }
        });

        const scheduleName = `${channelName}-extraction`

        this.schedulerRegistry.addCronJob(scheduleName, job);
        this.logger.log(`Job ${scheduleName} programado para ejecutarse con la expresión: ${cronExpression}`);

        // Iniciar el job inmediatamente.  Opcional, depende de si quieres que empiece ahora o espere al primer cron.
        this.schedulerRegistry.getCronJob(scheduleName).start();
    }


    // Opcional: Permite eliminar un job dinámicamente (ej: al modificar la configuración del canal)
    deleteCron(name: string) {
        this.schedulerRegistry.deleteCronJob(name);
        this.logger.warn(`Job ${name} eliminado!`);
    }


}
