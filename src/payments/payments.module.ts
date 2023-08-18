import { Module } from '@nestjs/common';
import { PaymentsController } from './controller/payments.controller';
import { PaymentsService } from './service/payments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from 'src/users/users.repository';
import { PaymentsRepository } from './payments.repository';
import { Payment } from './payments.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsRepository, UsersRepository],
  exports: [PaymentsService, PaymentsRepository],
})
export class PaymentsModule {}
