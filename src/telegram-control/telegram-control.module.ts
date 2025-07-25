import { Module } from '@nestjs/common';
import { TelegramControlService } from './telegram-control.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelConfiguration } from 'src/channel-data-extraction/entities/channel-configurations.entity';
import { LlmModule } from 'src/llm/llm.module';
import { CachedMessage } from 'src/channel-data-extraction/entities/cached-messages.entity';
import { CubanJobs } from 'src/channel-data-extraction/entities/channel-entities/cubanjobs.entity';

@Module({
  providers: [TelegramControlService],
  imports: [TypeOrmModule.forFeature([ChannelConfiguration]), TypeOrmModule.forFeature([CachedMessage])],
  exports: [TelegramControlService],
})
export class TelegramControlModule { }
