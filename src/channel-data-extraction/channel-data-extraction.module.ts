import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelConfiguration } from './entities/channel-configurations.entity';
import { ChannelDataExtractionService } from './channel-data-extraction.service';
import { TelegramControlService } from 'src/telegram-control/telegram-control.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { LlmModule } from 'src/llm/llm.module';
import { TelegramControlModule } from 'src/telegram-control/telegram-control.module';
import { CachedMessage } from './entities/cached-messages.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ChannelConfiguration]), TypeOrmModule.forFeature([CachedMessage]), LlmModule, TelegramControlModule],
    providers: [ChannelDataExtractionService, SchedulerRegistry],
    exports: [ChannelDataExtractionService]
})
export class ChannelDataExtractionModule { }
