import { Target } from 'src/target/domain/target';
import { CreateTargetDto } from './dto/create-target.dto';
import { FilterTargetDto } from './dto/filter-target.dto';
import { SmsTargetDto } from './dto/sms-target.dto';

export interface ITargetUseCase {
  createTarget(createTargetDto: CreateTargetDto): Promise<void>;
  filterTarget(filterTargetDto: FilterTargetDto): Promise<void>;
  smsTarget(smsTargetDto: SmsTargetDto): Promise<void>;
}

export const ITargetUseCaseSymbol = Symbol('ITargetUseCaseSymbol');
