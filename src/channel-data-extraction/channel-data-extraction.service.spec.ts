import { Test, TestingModule } from '@nestjs/testing';
import { ChannelDataExtractionService } from './channel-data-extraction.service';

describe('ChannelDataExtractionService', () => {
  let service: ChannelDataExtractionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChannelDataExtractionService],
    }).compile();

    service = module.get<ChannelDataExtractionService>(ChannelDataExtractionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
