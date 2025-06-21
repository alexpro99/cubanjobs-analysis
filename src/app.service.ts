import { Injectable } from '@nestjs/common';
import { StringSession } from 'telegram/sessions';
import { Api, TelegramClient } from 'telegram';
import { LlmService } from './llm/llm.service';

@Injectable()
export class AppService {
  constructor(private readonly llmService: LlmService) {


  }
}
