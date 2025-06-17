import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CachedMessage } from 'src/channel-data-extraction/entities/cached-messages.entity';
import { ChannelConfiguration } from 'src/channel-data-extraction/entities/channel-configurations.entity';
import { Api, TelegramClient } from 'telegram';
import { TotalList } from 'telegram/Helpers';
import { StringSession } from 'telegram/sessions';
import { In, Repository } from 'typeorm';
import * as crypto from 'crypto';

@Injectable()
export class TelegramControlService {
    private readonly logger = new Logger(TelegramControlService.name);

    client!: TelegramClient
    stringSession!: StringSession

    constructor(
        @InjectRepository(ChannelConfiguration)
        private channelConfigRepository: Repository<ChannelConfiguration>,
        @InjectRepository(CachedMessage)
        private cachedMessageRepository: Repository<CachedMessage>,
    ) {

        if (!process.env.API_ID) {
            throw new Error('API_ID is not set in environment variables');
        }
        if (!process.env.API_HASH) {
            throw new Error('API_HASH is not set in environment variables');
        }

        this.stringSession = new StringSession(process.env.SESSION_HASH); // fill this later with the value from session.save()

        this.client = new TelegramClient(
            this.stringSession,
            parseInt(process.env.API_ID),
            process.env.API_HASH,
            {
                retryDelay: 5 * 1000 * 60,
            },
        );

        this.client.connect()
    }


    async extractAndProcessMessages(
        channelName: string,
        messagesPerExtraction: number,
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

            if (newMessages && newMessages.length > 0) {
                // 3. Procesar los mensajes (aquí va tu lógica de procesamiento)
                await this.processMessages(newMessages, channelName);

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
    private async fetchMessagesFromTelegram(channelName: string, limit: number, offsetId: number): Promise<TotalList<Api.Message>> {
        return await this.client.getMessages(channelName, { limit, reverse: true, minId: offsetId });
    }


    private async processMessages(messages: TotalList<Api.Message>, channelName: string): Promise<void> {
        await this.handleCacheMessages(messages, channelName);
    }

    private async handleCacheMessages(messages: TotalList<Api.Message>, channelName: string): Promise<TotalList<Api.Message>> {
        const filteredMessages: any[] = [];

        // 1. Generar hashes para todos los mensajes
        const messageHashes = messages.map(message => {
            if (!message.message) return null;
            return this.generateMessageHash(message);
        }).filter(hash => hash !== null) as string[]; // Filtrar mensajes sin contenido


        // 2. Consultar la base de datos en lote
        const existingMessages = await this.cachedMessageRepository.find({
            where: { messageHash: In(messageHashes) },
        });

        const existingHashes = new Set(existingMessages.map(msg => msg.messageHash));


        for (const message of messages) {
            this.logger.log(`Procesando mensaje con id ${message.id} `);
            try {
                if (!message.message) continue;

                const hashedMessage = this.generateMessageHash(message);

                if (existingHashes.has(hashedMessage)) {
                    this.logger.log(`Mensaje ya procesado: ${hashedMessage}`);
                    continue; // Si el mensaje ya está en caché, saltar al siguiente
                }

                const channelConfig = await this.channelConfigRepository.findOne({
                    where: { channelName: channelName },
                });

                const cachedMessage = new CachedMessage();
                cachedMessage.messageHash = hashedMessage;
                cachedMessage.content = message.message;
                cachedMessage.timestamp = new Date(message.date * 1000);
                cachedMessage.authorId = message.fromId ? JSON.stringify(message.fromId) : 'unknown';
                cachedMessage.fromClass = message.fromId ? message.fromId.className : 'unknown';
                cachedMessage.messageId = message.id;

                if (channelConfig) {
                    cachedMessage.channel = channelConfig;
                }

                await this.cachedMessageRepository.save(cachedMessage);

                filteredMessages.push(message);
            } catch (error) {
                this.logger.error(`Error procesando mensaje con id ${message.id}: ${error.message}`, error.stack);
                // Continuar con el siguiente mensaje
                continue;
            }
        }

        return filteredMessages;
    }

    private generateMessageHash(message: Api.Message): string {
        const content = message.message || '';
        const authorId = message.fromId ? message.fromId.toString() : 'unknown';

        return crypto.createHash('sha256').update(content + authorId).digest('hex');
    }

    private extractOwnerId(message: Api.Message): bigInt.BigInteger | undefined {

        if (message.fromId?.className == 'PeerUser') return message.fromId.userId
        else if (message.fromId?.className == 'PeerChannel') return message.fromId.channelId
        else if (message.fromId?.className == 'PeerChat') return message.fromId.chatId
    }


}
