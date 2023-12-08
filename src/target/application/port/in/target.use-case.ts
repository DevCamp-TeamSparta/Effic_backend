import { SmsTargetDto } from './dto/sms-target.dto';
import { FilterTargetDto } from './dto/filter-target.dto';
import { CreateTargetTrigger1Dto } from './dto/create-target-trigger1.dto';

export interface ITargetUseCase {
  createTargetTrigger1(
    createTargetTrigger1Dto: CreateTargetTrigger1Dto,
  ): Promise<void>;
  filterTarget(filterTargetDto: FilterTargetDto): Promise<void>;
  smsTarget(smsTargetDto: SmsTargetDto): Promise<void>;
  smsTest(content: string, phoneNumber: number): Promise<void>;
}

export const ITargetUseCaseSymbol = Symbol('ITargetUseCaseSymbol');
