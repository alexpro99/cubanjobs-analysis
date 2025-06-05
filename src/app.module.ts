import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LlmModule } from './llm/llm.module';
import { ChannelDataExtractionService } from './channel-data-extraction/channel-data-extraction.service';

@Module({
  imports: [LlmModule],
  controllers: [AppController],
  providers: [AppService, ChannelDataExtractionService],
})
export class AppModule {
  
}
