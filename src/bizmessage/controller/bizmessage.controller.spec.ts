import { Test, TestingModule } from '@nestjs/testing';
import { BizmessageController } from './bizmessage.controller';

describe('BizmessageController', () => {
  let controller: BizmessageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BizmessageController],
    }).compile();

    controller = module.get<BizmessageController>(BizmessageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
