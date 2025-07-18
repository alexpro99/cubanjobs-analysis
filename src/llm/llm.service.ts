import { Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import * as dotenv from 'dotenv';
import { ChatOllama } from '@langchain/ollama';
import { JsonOutputParser } from "@langchain/core/output_parsers";

dotenv.config(); // Carga las variables de entorno desde .env

@Injectable()
export class LlmService {

  private readonly logger = new Logger(LlmService.name);

  private llmsPool: {
    openai: ChatOpenAI;
    googleGemini: ChatGoogleGenerativeAI;
    ollama: ChatOllama;
  };

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.warn(
        'La clave de API de OpenAI no está configurada en las variables de entorno.',
      );
    }
    if (!process.env.GOOGLE_API_KEY) {
      console.warn(
        'La clave de API de Google Gemini no está configurada en las variables de entorno.',
      );
    }

    this.llmsPool = {
      openai: new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4.1',
        streaming: false,
        maxRetries: 0
      }),
      googleGemini: new ChatGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_API_KEY,
        model: 'gemini-2.5-flash-lite-preview-06-17',
        streaming: false,
        maxRetries: 0
      }),
      ollama: new ChatOllama({
        model: 'gemma3:4b',
        streaming: false,
        keepAlive: '20m'
      })
    }

  }

  async extractInformationFromText(message: string, systemPrompt: string, models: string[] = ['googleGemini', 'openai', 'ollama']): Promise<any> {

    if (!message) {
      throw new Error('No hay mensaje que procesar.');
    }

    if (!systemPrompt) {
      throw new Error('No hay prompt del sistema definido.');
    }

    const escapedSystemPrompt = systemPrompt.replace(/\{/g, '{{').replace(/\}/g, '}}');

    const promptTemplate = ChatPromptTemplate.fromMessages([
      [
        'system',
        escapedSystemPrompt,
      ],
      ['human', '{text}'],
    ]);

    const parser = new JsonOutputParser<any>()

    for (const model of models) {
      const provider: ChatOpenAI | ChatGoogleGenerativeAI | ChatOllama | undefined = this.llmsPool[model];
      if (!provider) continue;
      this.logger.log(`Usando el modelo: ${provider.model}`)

      try {
        const prompt = await promptTemplate.partial({ text: message });

        const extractedInformation = await prompt.pipe(provider).pipe(parser).invoke({
          text: message,
        });

        return { extractedInformation, modelName: provider.model }
      } catch (error) {
        console.error("Llamada Fallida para: ", provider.model)
        console.log(error)
      }

    }
  }
}
