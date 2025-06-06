import { Injectable } from '@nestjs/common';
import { StringSession } from 'telegram/sessions';
import { Api, TelegramClient } from 'telegram';
import { LlmService } from './llm/llm.service';

@Injectable()
export class AppService {
  constructor(private readonly llmService: LlmService) {
    if (!process.env.API_ID) {
      console.warn('API_ID is not set in environment variables');
    }
    if (!process.env.API_HASH) {
      console.warn('API_HASH is not set in environment variables');
    }

  }

  //Ejemplo de como usar el cliente de Telegram para obtener mensajes de un canal
  async getHello(): Promise<any> {
    if (!process.env.API_ID) {
      throw new Error('API_ID is not set in environment variables');
    }
    if (!process.env.API_HASH) {
      throw new Error('API_HASH is not set in environment variables');
    }

    const stringSession = new StringSession(process.env.SESSION_HASH); // fill this later with the value from session.save()
    const client = new TelegramClient(
      stringSession,
      parseInt(process.env.API_ID),
      process.env.API_HASH,
      {},
    );

    await client.connect(); // This assumes you have already authenticated with .start()

    const result = await client.getMessages('cubanjobs', { limit: 10 });

    const resultMapped = result
      .map(
        (msg) =>
          `${msg.message}, ${new Date(msg.date * 1000).toDateString()}, ${JSON.stringify(msg.fromId)}`,
      )
      .join('\n --------- \n');

    return await this.llmService.extractInformationFromText(resultMapped);
  }

  testGramJS() { }
}
