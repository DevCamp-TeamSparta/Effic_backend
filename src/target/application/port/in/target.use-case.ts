import { Target } from 'src/target/domain/target';
import { CreateTargetDto } from './dto/create-target.dto';

export interface ITargetUseCase {
  createTarget(createTargetDto: CreateTargetDto);
}

export const ITargetUseCaseSymbol = Symbol('ITargetUseCaseSymbol');
