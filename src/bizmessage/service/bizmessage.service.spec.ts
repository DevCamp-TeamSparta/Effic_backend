import { Test, TestingModule } from '@nestjs/testing';
import { BizmessageService } from './bizmessage.service';

describe('BizmessageService', () => {
  let service: BizmessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BizmessageService],
    }).compile();

    service = module.get<BizmessageService>(BizmessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
