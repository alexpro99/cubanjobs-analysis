import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LlmModule } from './llm/llm.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelDataExtractionModule } from './channel-data-extraction/channel-data-extraction.module';
import { TelegramControlModule } from './telegram-control/telegram-control.module';
import ormconfig from 'ormconfig';
import { ChannelConfiguration } from './channel-data-extraction/entities/channel-configurations.entity';

@Module({
  imports: [LlmModule,
    TypeOrmModule.forRoot(ormconfig),
    TypeOrmModule.forFeature([ChannelConfiguration]),
    ChannelDataExtractionModule,
    TelegramControlModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {


}
