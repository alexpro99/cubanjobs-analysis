import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelConfiguration } from './entities/channel-configurations.entity';
import { ChannelDataExtractionService } from './channel-data-extraction.service';
import { TelegramControlService } from 'src/telegram-control/telegram-control.service';
import { SchedulerRegistry } from '@nestjs/schedule';

@Module({
    imports: [TypeOrmModule.forFeature([ChannelConfiguration])],
    providers: [ChannelDataExtractionService, TelegramControlService, SchedulerRegistry],
    exports: [ChannelDataExtractionService]
})
export class ChannelDataExtractionModule { }
