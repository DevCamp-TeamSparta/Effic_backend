import { Test, TestingModule } from '@nestjs/testing';
import { ShorturlService } from './shorturl.service';

describe('ShorturlService', () => {
  let service: ShorturlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShorturlService],
    }).compile();

    service = module.get<ShorturlService>(ShorturlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
