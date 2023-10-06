import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import {
  BizmessageNcpResultsRepository,
  BizmessageUrlResultRepository,
} from '../repository/biz-result.repository';
import { BizmessageService } from 'src/bizmessage/service/bizmessage.service';
import { ShorturlService } from 'src/shorturl/service/shorturl.service';
import { UsersService } from 'src/users/service/users.service';
import { bizmessageType } from 'src/bizmessage/bizmessage.enum';
import { BizNcpResult, BizUrlResult } from '../entity/biz-result.entity';
import * as crypto from 'crypto';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  BizmessageContentRepository,
  BizmessageRepository,
} from 'src/bizmessage/bizmessage.repository';
import { BizmessageContent } from 'src/bizmessage/bizmessage.entity';

@Injectable()
export class BizmessageResultsService {
  private logger = new Logger('BizmessageResultsService');
  constructor(
    private readonly bizmessageService: BizmessageService,
    private readonly usersService: UsersService,
    private readonly shorturlService: ShorturlService,
    private readonly bizmessageRepository: BizmessageRepository,
    private readonly bizmessageNcpResultsRepository: BizmessageNcpResultsRepository,
    private readonly bizmessageUrlResultsRepository: BizmessageUrlResultRepository,
    private readonly bizmessageContentRepository: BizmessageContentRepository,
    private readonly urlInfosRepository: ShorturlService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  // ncp 결과
  async ncpResult(bizmessageId: number, userId: number): Promise<any> {
    const bizmessage =
      await this.bizmessageService.findOneBizmessageInfoByBizmessageId(
        bizmessageId,
      );
    const user = await this.usersService.findUserByUserId(userId);
    const userNcpInfo = await this.usersService.findUserNcpInfoByUserId(userId);
    await this.bizmessageService.findOneBizmessageContentByBizmessageId(
      bizmessageId,
    );

    if (!bizmessage || !user) {
      throw new BadRequestException('Invalid request');
    }

    if (bizmessage.sentType === bizmessageType.N) {
      return { success: 0, reserved: bizmessage.receiverList.length, fail: 0 };
    }

    let success = 0;
    let fail = 0;
    let reserved = 0;

    for (const requestId of bizmessage.ncpRequestIdList) {
      const now = Date.now().toString();
      const headers = {
        'x-ncp-apigw-timestamp': now,
        'x-ncp-iam-access-key': userNcpInfo.accessKey,
        'x-ncp-apigw-signature-v2': await this.makeSignature(
          userNcpInfo,
          requestId,
          now,
        ),
      };

      try {
        const response = await axios.get(
          `https://sens.apigw.ntruss.com/friendtalk/v2/services/${userNcpInfo.bizServiceId}/messages?requestId=${requestId}`,
          { headers },
        );

        for (let i = 0; i < response.data.itemCount; i++) {
          if (response.data.messages[i].messageStatusName === 'success') {
            success++;
          } else if (response.data.messages[i].messageStatusName === 'fail') {
            fail++;
          } else if (
            response.data.messages[i].messageStatusName === 'processing'
          ) {
            reserved++;
          }
        }
      } catch (error) {
        if (error.response) {
          throw new HttpException(error.response.data, error.response.status);
        }
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
    return { success, reserved, fail };
  }

  async makeSignature(userNcpInfo, requestId, timestamp) {
    const message = [];
    const hmac = crypto.createHmac('sha256', userNcpInfo.secretKey);
    const space = ' ';
    const newLine = '\n';
    const method = 'GET';
    message.push(method);
    message.push(space);
    message.push(
      `/friendtalk/v2/services/${userNcpInfo.bizServiceId}/messages?requestId=${requestId}`,
    );
    message.push(newLine);
    message.push(timestamp);
    message.push(newLine);
    message.push(userNcpInfo.accessKey);

    const signature = hmac.update(message.join('')).digest('base64');
    return signature.toString();
  }

  // 단축 url 결과
  async shortUrlResult(bizmessageId: number): Promise<any> {
    const bizmessage =
      await this.bizmessageService.findOneBizmessageInfoByBizmessageId(
        bizmessageId,
      );
    if (!bizmessage) {
      throw new BadRequestException('bizmessageId is wrong');
    }

    if (bizmessage.sentType === bizmessageType.N) {
      return [];
    }

    const contentArray = [];
    const buttonArray = [];
    const imageArray = [];

    if (bizmessage.contentIdStringList) {
      for (const idString of bizmessage.contentIdStringList) {
        contentArray.push({
          ...(await this.shorturlService.getShorturlResult(idString)),
          idString,
        });
      }
    }

    if (bizmessage.imageIdString) {
      for (const idString of bizmessage.imageIdString) {
        imageArray.push({
          ...(await this.shorturlService.getShorturlResult(idString)),
          idString,
        });
      }
    }

    if (bizmessage.buttonIdStringList) {
      for (const button of bizmessage.buttonIdStringList) {
        const buttonObject = {};
        for (const key of Object.keys(button)) {
          buttonObject[key] = {
            ...(await this.shorturlService.getShorturlResult(button[key])),
            idString: button[key],
          };
        }
        buttonArray.push(buttonObject);
      }
    }
    return { contentArray, imageArray, buttonArray };
  }

  async createBizUrlResultEntities(
    entityManager,
    bizmessage,
    bizNcpResultId,
    user,
    results,
  ) {
    for (const result of results) {
      const resultEntity = entityManager.create(BizUrlResult, {
        bizmessage: bizmessage,
        humanclicks: result.humanclicks,
        totalclicks: result.totalclicks,
        idString: result.idString,
        bizNcpResultId: bizNcpResultId,
        user: user,
      });
      await entityManager.save(resultEntity);
    }
  }

  // 친구톡 결과조회
  async BizmessageResult(bizmessageId: number, userId: number): Promise<any> {
    const bizmessage =
      await this.bizmessageService.findOneBizmessageInfoByBizmessageId(
        bizmessageId,
      );
    const user = await this.usersService.findUserByUserId(userId);
    const newBizNcpResult = await this.ncpResult(bizmessageId, userId);

    const resultEntity = this.entityManager.create(BizNcpResult, {
      bizmessage: bizmessage,
      success: newBizNcpResult.success,
      reserved: newBizNcpResult.reserved,
      fail: newBizNcpResult.fail,
      createdAt: new Date(),
      user: user,
    });

    const bizNcpResultId = (await this.entityManager.save(resultEntity))
      .bizNcpResultId;

    const newBizUrlResult = await this.shortUrlResult(bizmessageId);

    if (newBizUrlResult.contentArray) {
      await this.createBizUrlResultEntities(
        this.entityManager,
        bizmessage,
        bizNcpResultId,
        user,
        newBizUrlResult.contentArray,
      );
    }

    if (newBizUrlResult.imageArray) {
      await this.createBizUrlResultEntities(
        this.entityManager,
        bizmessage,
        bizNcpResultId,
        user,
        newBizUrlResult.imageArray,
      );
    }

    if (newBizUrlResult.buttonArray) {
      for (const result of newBizUrlResult.buttonArray) {
        await this.createBizUrlResultEntities(
          this.entityManager,
          bizmessage,
          bizNcpResultId,
          user,
          Object.values(result),
        );
      }
    }

    const bizmessageNcpResults =
      await this.bizmessageNcpResultsRepository.findAllByBizmessageId(
        bizmessageId,
      );
    if (!bizmessageNcpResults) {
      throw new NotFoundException('NcpBizmessageId is wrong');
    }

    const bizmessageResults = [];

    for (const ncpResult of bizmessageNcpResults) {
      const bizmessageUrlResults =
        await this.bizmessageUrlResultsRepository.findAllByResultId(
          ncpResult.bizNcpResultId,
        );

      const result = {
        bizmessage: bizmessageId,
        user: ncpResult.userId,
        urls: {
          content: [],
          image: [],
          button: [],
        },
        success: ncpResult.success,
        reserved: ncpResult.reserved,
        fail: ncpResult.fail,
        createdAt: ncpResult.createdAt,
      };

      // button
      if (bizmessageUrlResults.length && bizmessage.buttonIdStringList) {
        for (const button of bizmessage.buttonIdStringList) {
          const buttonObject = {};
          for (const key of Object.keys(button)) {
            const urlResult = bizmessageUrlResults.find((result) => {
              return result.idString === button[key];
            });
            const urlInfo = await this.shorturlService.findUrlInfoByIdString(
              button[key],
            );
            buttonObject[key] = {
              idString: urlResult.idString,
              shortUrl: urlInfo.shortenUrl,
              originalUrl: urlInfo.originalUrl,
              humanclicks: urlResult.humanclicks,
              totalclicks: urlResult.totalclicks,
            };
          }
          if (Object.keys(buttonObject).length !== 0) {
            result.urls.button.push(buttonObject);
          }
        }
      }

      for (const urlResult of bizmessageUrlResults) {
        if (ncpResult.bizmessageId !== urlResult.bizmessageId) {
          throw new Error('unreachable!');
        }
        const urlInfo = await this.shorturlService.findUrlInfoByIdString(
          urlResult.idString,
        );

        // content
        if (bizmessage.contentIdStringList.includes(urlResult.idString)) {
          result.urls.content.push({
            idString: urlResult.idString,
            shortUrl: urlInfo.shortenUrl,
            originalUrl: urlInfo.originalUrl,
            humanclicks: urlResult.humanclicks,
            totalclicks: urlResult.totalclicks,
          });
        }

        // image
        if (bizmessage.imageIdString.includes(urlResult.idString)) {
          result.urls.image.push({
            idString: urlResult.idString,
            shortUrl: urlInfo.shortenUrl,
            originalUrl: urlInfo.originalUrl,
            humanclicks: urlResult.humanclicks,
            totalclicks: urlResult.totalclicks,
          });
        }
      }
      bizmessageResults.push(result);
    }
    return bizmessageResults;
  }

  async bizmessageGroupResult(groupId: number, userId: number): Promise<any> {
    const result = this.bizmessageService.findAllBizmessageByGroupId(groupId);
    if (!result) {
      throw new NotFoundException('groupId is wrong');
    }

    const user = await this.usersService.findUserByUserId(userId);
    if (!user) {
      throw new NotFoundException('userId is wrong');
    }

    const bizmessages = await this.bizmessageService.findAllBizmessageByGroupId(
      groupId,
    );
    if (!bizmessages) {
      throw new NotFoundException('bizmessages is wrong');
    }

    const results = await Promise.all(
      bizmessages.map(async (bizmessage) => {
        const [content, result] = await Promise.all([
          this.bizmessageService.findOneBizmessageContentByBizmessageId(
            bizmessage.bizmessageId,
          ),
          this.BizmessageResult(bizmessage.bizmessageId, userId),
        ]);
        return { bizmessage: bizmessage, content: content, result: result };
      }),
    );

    return results;
  }

  // abTest Url 클릭 수 결과조회
  async abTestUrlResult(aBizmessageId: number, bBizmessageId: number) {
    const aBizmessage =
      await this.bizmessageService.findOneBizmessageInfoByBizmessageId(
        aBizmessageId,
      );
    const bBizmessage =
      await this.bizmessageService.findOneBizmessageInfoByBizmessageId(
        bBizmessageId,
      );
    if (!aBizmessage || !bBizmessage) {
      throw new BadRequestException('bizmessageId is wrong');
    }

    if (aBizmessage.buttonIdStringList) {
      const aBizmessagefirstButtonPcAndMobileClicks = await Promise.all([
        this.shorturlService.getShorturlResult(
          aBizmessage.buttonIdStringList[0].pc,
        ),
        this.shorturlService.getShorturlResult(
          aBizmessage.buttonIdStringList[0].mobile,
        ),
      ]);
      const bBizmessagefirstButtonPcAndMobileClicks = await Promise.all([
        this.shorturlService.getShorturlResult(
          bBizmessage.buttonIdStringList[0].pc,
        ),
        this.shorturlService.getShorturlResult(
          bBizmessage.buttonIdStringList[0].mobile,
        ),
      ]);

      const aBizmessageClicks =
        aBizmessagefirstButtonPcAndMobileClicks[0].humanClicks +
        aBizmessagefirstButtonPcAndMobileClicks[1].humanClicks;

      const bBizmessageClicks =
        bBizmessagefirstButtonPcAndMobileClicks[0].humanClicks +
        bBizmessagefirstButtonPcAndMobileClicks[1].humanClicks;

      return { aBizmessageClicks, bBizmessageClicks };
    } else if (aBizmessage.imageIdString) {
      const aBizmessageClicks = await this.shorturlService.getShorturlResult(
        aBizmessage.imageIdString[0],
      );
      const bBizmessageClicks = await this.shorturlService.getShorturlResult(
        bBizmessage.imageIdString[0],
      );

      return { aBizmessageClicks, bBizmessageClicks };
    } else if (aBizmessage.contentIdStringList) {
      const aBizmessageClicks = await this.shorturlService.getShorturlResult(
        aBizmessage.contentIdStringList[0],
      );
      const bBizmessageClicks = await this.shorturlService.getShorturlResult(
        bBizmessage.contentIdStringList[0],
      );

      return { aBizmessageClicks, bBizmessageClicks };
    }
  }

  // winnerBizmessage 보내기
  async sendWinnerBizmessage(bizmessage, bizmessageContent) {
    const { shortButtonLinkList, shortImageLink } =
      await this.bizmessageService.makeshortLinks(bizmessageContent.content);

    const requestIdList: string[] = [];
    const receiverList = bizmessageContent.remainReceiverList;
    const receiverListLength = receiverList.length;
    const receiverCount = Math.ceil(receiverListLength / 100);
    let takeBody;
    const imageIdString = [];
    const contentIdStringList = [];
    const buttonIdStringList = [];

    for (let i = 0; i < receiverCount; i++) {
      const receiverListForSend = receiverList.slice(i * 100, (i + 1) * 100);
      const body = await this.bizmessageService.makeBody(
        bizmessage.userId,
        bizmessageContent.content.bizMessageInfoList,
        bizmessageContent,
        bizmessageContent.plusFriendId,
        receiverListForSend,
        shortButtonLinkList,
        shortImageLink,
      );
      takeBody = body;
      requestIdList.push(body.response.data.requestId);
    }
    contentIdStringList.push(...takeBody.idStrings);

    if (shortImageLink) {
      imageIdString.push(shortImageLink.idString);
    }
    if (shortButtonLinkList) {
      shortButtonLinkList.forEach((button) => {
        buttonIdStringList.push({
          mobile: button.shortbuttonMobile.idString,
          pc: button.shortbuttonPc.idString,
        });
      });
    }

    return {
      requestIdList: requestIdList,
      imageIdString: imageIdString,
      contentIdStringList: contentIdStringList,
      buttonIdStringList: buttonIdStringList,
      shortendUrls: takeBody.shortendUrls,
    };
  }

  // bizmessage 결과 전체 조회
  async allBizmessageGroupResult(userId: number) {
    const user = await this.usersService.findUserByUserId(userId);
    if (!user) {
      throw new BadRequestException('email is wrong');
    }

    const messageGroups =
      await this.bizmessageService.findAllBizmessageGroupByUserId(userId);
    if (!messageGroups) {
      throw new BadRequestException('email is wrong');
    }

    const results = await Promise.all(
      messageGroups.map(async (messageGroup) => {
        return this.bizmessageGroupResult(
          messageGroup.bizmessageGroupId,
          userId,
        );
      }),
    );
    return results;
  }

  // 친구톡 결과 polling
  @Cron('30 */1 * * *', { name: 'bizmessageResultPolling' })
  async handlebizmessageResultPolling() {
    this.logger.log('bizmessageResultPolling');
    const bizmessages = await this.bizmessageService.findThreeDaysBeforeSend();

    for (const bizmessage of bizmessages) {
      const user = await this.usersService.findUserByUserId(bizmessage.userId);

      try {
        const ncpResult = await this.ncpResult(
          bizmessage.bizmessageId,
          user.userId,
        );

        const resultEntity = this.entityManager.create(BizNcpResult, {
          bizmessage: bizmessage,
          success: ncpResult.success,
          reserved: ncpResult.reserved,
          fail: ncpResult.fail,
          createdAt: new Date(),
          user: user,
        });

        const bizNcpResultId = (await this.entityManager.save(resultEntity))
          .bizNcpResultId;

        console.log(
          `NCP results for bizmessage ${bizmessage.bizmessageId} saved`,
        );

        if (bizmessage.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
          try {
            const shortUrlResults = await this.shortUrlResult(
              bizmessage.bizmessageId,
            );

            if (
              shortUrlResults.contentArray ||
              shortUrlResults.imageArray ||
              shortUrlResults.buttonArray
            ) {
              for (const result of shortUrlResults.contentArray) {
                const resultEntity = this.entityManager.create(BizUrlResult, {
                  bizmessage: bizmessage,
                  humanclicks: result.humanclicks,
                  totalclicks: result.totalclicks,
                  idString: result.idString,
                  bizNcpResultId: bizNcpResultId,
                  user: user,
                });
                await this.entityManager.save(resultEntity);
              }
              for (const result of shortUrlResults.imageArray) {
                const resultEntity = this.entityManager.create(BizUrlResult, {
                  bizmessage: bizmessage,
                  humanclicks: result.humanclicks,
                  totalclicks: result.totalclicks,
                  idString: result.idString,
                  bizNcpResultId: bizNcpResultId,
                  user: user,
                });
                await this.entityManager.save(resultEntity);
              }
              for (const result of shortUrlResults.buttonArray) {
                for (const key of Object.keys(result)) {
                  const resultEntity = this.entityManager.create(BizUrlResult, {
                    bizmessage: bizmessage,
                    humanclicks: result[key].humanclicks,
                    totalclicks: result[key].totalclicks,
                    idString: result[key].idString,
                    bizNcpResultId: bizNcpResultId,
                    user: user,
                  });
                  await this.entityManager.save(resultEntity);
                }
              }
              console.log(
                `Short url results for bizmessage ${bizmessage.bizmessageId} saved.`,
              );
            }
          } catch (error) {
            console.error(
              `Failed to fetch short url results for bizmessage ${bizmessage.bizmessageId}`,
              error,
            );
          }
        }
      } catch (error) {
        console.log(
          `Failed to fetch NCP results for bizmessage ${bizmessage.bizmessageId}`,
          error,
        );
      }
    }
  }

  // A/B 테스트 결과 polling
  @Cron(CronExpression.EVERY_5_MINUTES, { name: 'abTestResultPolling' })
  async handleAbTestResultPolling() {
    this.logger.log('abTestResultPolling');
    const bizmessages = await this.bizmessageService.findNotSend();

    for (const bizmessage of bizmessages) {
      try {
        const aBizmessageId = bizmessage.bizmessageId - 2;
        const bBizmessageId = bizmessage.bizmessageId - 1;

        const { aBizmessageClicks, bBizmessageClicks } =
          await this.abTestUrlResult(aBizmessageId, bBizmessageId);

        if (aBizmessageClicks >= bBizmessageClicks) {
          const bizmessage =
            await this.bizmessageService.findOneBizmessageInfoByBizmessageId(
              aBizmessageId,
            );

          const bizmessageContent =
            await this.bizmessageService.findOneBizmessageContentByBizmessageId(
              aBizmessageId,
            );

          const response = await this.sendWinnerBizmessage(
            bizmessage,
            bizmessageContent,
          );

          const newBizmessage =
            await this.bizmessageService.findOneBizmessageInfoByBizmessageId(
              aBizmessageId + 2,
            );
          newBizmessage.isSent = true;
          newBizmessage.sentType = bizmessageType.A;
          newBizmessage.buttonIdStringList = response.buttonIdStringList;
          newBizmessage.contentIdStringList = response.contentIdStringList;
          newBizmessage.imageIdString = response.imageIdString;
          newBizmessage.ncpRequestIdList = response.requestIdList;
          await this.bizmessageRepository.save(newBizmessage);

          const newBizmessageContent = new BizmessageContent();
          newBizmessageContent.bizmessage = newBizmessage;
          newBizmessageContent.sentType = bizmessageType.A;
          newBizmessageContent.content = bizmessageContent.content;
          newBizmessageContent.plusFriendId = bizmessageContent.plusFriendId;
          newBizmessageContent.receiverList =
            bizmessageContent.remainReceiverList;
          newBizmessageContent.bizmessageGroupId =
            bizmessageContent.bizmessageGroupId;
          newBizmessageContent.title = bizmessageContent.title;
          await this.bizmessageContentRepository.save(newBizmessageContent);
        } else {
          const bizmessage =
            await this.bizmessageService.findOneBizmessageInfoByBizmessageId(
              bBizmessageId,
            );

          const bizmessageContent =
            await this.bizmessageService.findOneBizmessageContentByBizmessageId(
              bBizmessageId,
            );

          const response = await this.sendWinnerBizmessage(
            bizmessage,
            bizmessageContent,
          );

          const newBizmessage =
            await this.bizmessageService.findOneBizmessageInfoByBizmessageId(
              bBizmessageId + 1,
            );
          newBizmessage.isSent = true;
          newBizmessage.sentType = bizmessageType.B;
          newBizmessage.buttonIdStringList = response.buttonIdStringList;
          newBizmessage.contentIdStringList = response.contentIdStringList;
          newBizmessage.imageIdString = response.imageIdString;
          newBizmessage.ncpRequestIdList = response.requestIdList;
          await this.bizmessageRepository.save(newBizmessage);

          const newBizmessageContent = new BizmessageContent();
          newBizmessageContent.bizmessage = newBizmessage;
          newBizmessageContent.sentType = bizmessageType.B;
          newBizmessageContent.content = bizmessageContent.content;
          newBizmessageContent.plusFriendId = bizmessageContent.plusFriendId;
          newBizmessageContent.receiverList =
            bizmessageContent.remainReceiverList;
          newBizmessageContent.bizmessageGroupId =
            bizmessageContent.bizmessageGroupId;
          newBizmessageContent.title = bizmessageContent.title;
          await this.bizmessageContentRepository.save(newBizmessageContent);
        }
        console.log(
          `A/B test results for bizmessage ${bizmessage.bizmessageId} saved.`,
        );
      } catch (error) {
        console.error(
          `Failed to fetch ab test results for bizmessage ${bizmessage.bizmessageId}.`,
          error,
        );
      }
    }
  }
}
