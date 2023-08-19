import {
  ConsoleLogger,
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectEntityManager } from '@nestjs/typeorm';
import { UsersRepository } from 'src/users/users.repository';
import { MessagesRepository } from 'src/messages/messages.repository';
import { ResultsRepository } from '../results.repository';
import { ResultsService } from '../service/results.service';
import { DefaultResultDto } from 'src/messages/dto/default-result.dto';
import { Result } from '../result.entity';

@Injectable()
export class DefaultSchedulerService {
  create: any;
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly usersRepository: UsersRepository,
    private readonly resultsRepository: ResultsRepository,
    private readonly resultsService: ResultsService,
    readonly logger: Logger,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES) // url 결과. 24시간만 실행. createdAt이 24시간 이전인 메시지만 실행
  async handleUrlCron() {
    const messages =
      await this.resultsRepository.findOlderThanTwentyFourHours();

    // for (const message of messages) {
    //   const result = await this.resultsService.shortUrlResult(
    //     message.messageId,
    //   );
    //   await this.saveUrlResult(result);
    // }
  }

  async saveUrlResult(defaultResultDto: DefaultResultDto) {
    const { totalClicks, humanClicks } = defaultResultDto;
    const newResult = this.create({
      totalClicks: totalClicks,
      humanClicks: humanClicks,
    });
    await this.messagesRepository.save(newResult);
  }

  @Cron('0 */1 * * *') // 시간별로 ncp 결과를 가져옴. createdAt이 72시간 이전인 메시지만 실행
  async handleNcpCron() {
    const messages = await this.resultsRepository.findOlderThanThreeDays();

    for (const message of messages) {
      // this.logger.log(message);
      console.log(message);
      const user = await this.usersRepository.findOneByUserId(message.userId);

      try {
        const ncpResult = await this.resultsService.ncpResult(
          message.messageId,
          user.email,
        );

        const resultEntity = this.entityManager.create(Result, {
          message: message,
          success: ncpResult.success,
          reserved: ncpResult.reserved,
          fail: ncpResult.fail,
        });

        await this.entityManager.save(resultEntity);

        console.log(`NCP results for message ${message.messageId} saved.`);
      } catch (error) {
        console.error(
          `Failed to fetch NCP results for message ${message.messageId}.`,
          error,
        );
      }
    }
  }
}
