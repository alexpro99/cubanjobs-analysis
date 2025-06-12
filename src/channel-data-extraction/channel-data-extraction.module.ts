import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelConfiguration } from './entities/channel-configurations.entity';
import { ChannelDataExtractionService } from './channel-data-extraction.service';
import { TelegramControlService } from 'src/telegram-control/telegram-control.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { LlmService } from 'src/llm/llm.service';

@Module({
    imports: [TypeOrmModule.forFeature([ChannelConfiguration]), LlmModule],
    providers: [ChannelDataExtractionService, TelegramControlService, SchedulerRegistry],
    exports: [ChannelDataExtractionService]
})
export class ChannelDataExtractionModule { }
