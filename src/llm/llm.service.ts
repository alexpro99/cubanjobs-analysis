import { Injectable } from '@nestjs/common';
import { ChatOpenAI, OpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import * as dotenv from 'dotenv';
import { JOBS_SCHEMA } from './schemas/jobs.schema';
import { ChatOllama } from '@langchain/ollama';

dotenv.config(); // Carga las variables de entorno desde .env

@Injectable()
export class LlmService {

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
        temperature: 0,
      }),
      googleGemini: new ChatGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_API_KEY,
        model: 'gemini',
      }),
      ollama: new ChatOllama({
        model: 'gemma3:4b'
      })
    }

  }

  async extractInformationFromText(message: string, systemPrompt: string, models: string[] = ['googleGemini', 'openai', 'ollama']): Promise<any> {

    const promptTemplate = ChatPromptTemplate.fromMessages([
      [
        'system',
        systemPrompt,
      ],
      ['human', '{text}'],
    ]);

    for (const model of models) {
      const provider = this.llmsPool[model];
      if (!provider) continue;

      try {
        const structured_llm = provider.withStructuredOutput(JOBS_SCHEMA);

        const prompt = await promptTemplate.invoke({ text: message });

        return await structured_llm.invoke(prompt);

      } catch (error) {
        console.error("Llamada Fallida para: ", provider.model)
        console.log(error)
      }

    }

  }
}
