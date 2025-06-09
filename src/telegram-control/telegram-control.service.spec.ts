import { Test, TestingModule } from '@nestjs/testing';
import { TelegramControlService } from './telegram-control.service';

describe('TelegramControlService', () => {
  let service: TelegramControlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TelegramControlService],
    }).compile();

    service = module.get<TelegramControlService>(TelegramControlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
