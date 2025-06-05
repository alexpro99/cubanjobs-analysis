import { Injectable } from '@nestjs/common';
import { ChatOpenAI, OpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import * as dotenv from 'dotenv';
import { JOBS_SCHEMA } from './schemas/jobs.schema';

dotenv.config(); // Carga las variables de entorno desde .env

@Injectable()
export class LlmService {
  private openai: ChatOpenAI;
  private googleGemini: ChatGoogleGenerativeAI;

  private providersPool: (ChatOpenAI | ChatGoogleGenerativeAI)[]

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

    console.log(process.env.GOOGLE_API_KEY, '.s.s.s.s.s')
    this.openai = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4.1',
      temperature: 0,
    });

    this.googleGemini = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      model: 'gemini',
    });

    this.providersPool = [this.openai, this.googleGemini]
  }

  async extractInformationFromText(message: string): Promise<any> {

    const promptTemplate = ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are an expert extraction algorithm.
    Only extract relevant information from the text.
    If you do not know the value of an attribute asked to extract,
    return null for the attribute's value.`,
      ],
      // Please see the how-to about improving performance with
      // reference examples.
      // ["placeholder", "{examples}"],
      ['human', '{text}'],
    ]);

    for (const provider of this.providersPool) {

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
