import { Test, TestingModule } from '@nestjs/testing';
import { ShorturlController } from './shorturl.controller';

describe('ShorturlController', () => {
  let controller: ShorturlController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShorturlController],
    }).compile();

    controller = module.get<ShorturlController>(ShorturlController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
