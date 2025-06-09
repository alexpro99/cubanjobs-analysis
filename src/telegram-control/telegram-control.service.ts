import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelConfiguration } from 'src/channel-data-extraction/entities/channel-configurations.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TelegramControlService {
    private readonly logger = new Logger(TelegramControlService.name);

    constructor(@InjectRepository(ChannelConfiguration)
    private channelConfigRepository: Repository<ChannelConfiguration>) { }


    async extractAndProcessMessages(
        channelName: string,
        messagesPerExtraction: number,
        extractionPrompt: string,
        channelId: string, // ID del canal para actualizar lastExtractedMessageId
    ): Promise<void> {
        this.logger.log(`Extrayendo y procesando mensajes para el canal: ${channelName}`);

        try {
            // 1. Obtener la configuración actual del canal (incluyendo lastExtractedMessageId)
            const channelConfig = await this.channelConfigRepository.findOne({ where: { id: channelId } });

            if (!channelConfig) {
                this.logger.error(`No se encontró la configuración para el canal con ID: ${channelId}`);
                return;
            }

            const lastExtractedMessageId = channelConfig.lastExtractedMessageId;

            // 2. Lógica para conectarse a Telegram, obtener mensajes (usando lastExtractedMessageId), y procesarlos
            const newMessages = await this.fetchMessagesFromTelegram(channelName, messagesPerExtraction, lastExtractedMessageId);  // Reemplaza con tu lógica real

            console.log(newMessages, '.s.s.')

            if (newMessages && newMessages.length > 0) {
                // 3. Procesar los mensajes (aquí va tu lógica de procesamiento)
                await this.processMessages(newMessages, extractionPrompt);

                // 4. Actualizar lastExtractedMessageId en la base de datos.  Asumo que los mensajes tienen un ID numérico y ordenado.
                const lastMessageId = newMessages[newMessages.length - 1].id; // Asumiendo que 'id' es la propiedad del ID del mensaje
                channelConfig.lastExtractedMessageId = lastMessageId;

                await this.channelConfigRepository.save(channelConfig);

                this.logger.log(`Se procesaron ${newMessages.length} mensajes para el canal ${channelName}.  Nuevo lastExtractedMessageId: ${lastMessageId}`);
            } else {
                this.logger.log(`No se encontraron mensajes nuevos para el canal ${channelName}.`);
            }

        } catch (error) {
            this.logger.error(`Error al extraer y procesar mensajes para el canal ${channelName}: ${error.message}`, error.stack);
            throw error; // Re-lanza el error para que ExtractionService pueda manejarlo
        }
    }


    // Simulacro de la función para obtener mensajes de Telegram
    private async fetchMessagesFromTelegram(channelName: string, limit: number, offsetId: number): Promise<{ id: number; text: string }[]> {
        //  Aquí iría tu lógica para conectarte a la API de Telegram y obtener los mensajes.
        //  Este es solo un ejemplo que devuelve mensajes simulados.
        const messages: { id: number; text: string }[] = [];
        for (let i = 0; i < limit; i++) {
            messages.push({
                id: offsetId + i + 1,
                text: `Mensaje ${offsetId + i + 1} del canal ${channelName}`,
            });
        }
        return messages;
    }


    private async processMessages(messages: { id: number; text: string }[], extractionPrompt: string): Promise<void> {
        // Aquí iría tu lógica para procesar los mensajes extraídos,
        // utilizando el extractionPrompt.
        this.logger.log(`Procesando ${messages.length} mensajes con el prompt: ${extractionPrompt}`);
        messages.forEach(message => {
            this.logger.log(`Procesando mensaje ${message.id}: ${message.text}`);
            // Lógica de procesamiento del mensaje aquí
        });
    }

}
