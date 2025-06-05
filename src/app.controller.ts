import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { LlmService } from './llm/llm.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly llmService: LlmService,
  ) {}

  @Get()
  getHello(): any {
    return this.appService.getHello();
  }

  @Post('llm')
  async getLlmResponse(
    @Body('userPrompt') userPrompt: string,
    @Body('systemPrompt') systemPrompt: string,
    @Body('variables') variables: Record<string, any>,
  ): Promise<any> {
    console.log({
      userPrompt,
      systemPrompt,
      variables,
    });

    // const response = await this.llmService.getResponseFromOpenAI(
    //   userPrompt,
    //   systemPrompt,
    //   variables,
    // );

    return 'en desarrollo'
  }
}
