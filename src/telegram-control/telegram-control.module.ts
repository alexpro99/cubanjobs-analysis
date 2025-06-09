import { Module } from '@nestjs/common';
import { TelegramControlService } from './telegram-control.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelConfiguration } from 'src/channel-data-extraction/entities/channel-configurations.entity';

@Module({
  providers: [TelegramControlService],
  imports: [TypeOrmModule.forFeature([ChannelConfiguration])]
})
export class TelegramControlModule { }
