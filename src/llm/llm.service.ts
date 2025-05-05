import { Injectable } from '@nestjs/common';
import { ChatOpenAI, OpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import * as dotenv from 'dotenv';
import { JOBS_SCHEMA } from './schemas/jobs.schema';

dotenv.config(); // Carga las variables de entorno desde .env

@Injectable()
export class LlmService {
  private openai: OpenAI;
  private googleGemini: ChatGoogleGenerativeAI;

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

    this.openai = new OpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    this.googleGemini = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      model: 'gemini',
    });
  }

  async getResponseFromOpenAI(
    userPrompt: string,
    systemPrompt: string = '',
    variables: Record<string, any> = {},
  ): Promise<string> {
    const promptTemplate = ChatPromptTemplate.fromMessages([
      ['system', systemPrompt],
      ['user', userPrompt],
    ]);

    const prompt = await promptTemplate.invoke(variables);

    return await this.openai.invoke(prompt.toChatMessages());
  }

  async extractInformationFromText(message: string): Promise<any> {
    const openAiChat = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4o-mini',
      temperature: 0,
    });

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

    if (!openAiChat) {
      throw new Error('OpenAI instance is not initialized.');
    }

    const structured_llm = openAiChat.withStructuredOutput(JOBS_SCHEMA);

    const prompt = await promptTemplate.invoke({ text: message });

    return await structured_llm.invoke(prompt);
  }
}
