import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { tlyConfig, shortIoConfig } from 'config/short-io.config';
import { UrlInfosRepository } from '../shorturl.repository';
import { TlyUrlInfo, UrlInfo } from '../shorturl.entity';
import got from 'got';

@Injectable()
export class ShorturlService {
  constructor(
    private readonly urlInfosRepository: UrlInfosRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  // 단축 URL 생성
  async createShorturl(url: string) {
    const token = tlyConfig.secretKey;
    const tlyResponse = await got<{
      short_url: string;
      long_url: string;
      short_id: string;
    }>({
      method: 'POST',
      url: 'https://t.ly/api/v1/link/shorten',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      json: {
        long_url: url,
      },
      responseType: 'json',
    });

    return got<{
      shortURL: string;
      idString: string;
      originalURL: string;
    }>({
      method: 'POST',
      url: 'https://api.short.io/links',
      headers: {
        authorization: shortIoConfig.secretKey,
      },
      json: {
        originalURL: tlyResponse.body.short_url,
        domain: 'effi.kr',
        allowDuplicates: true,
      },
      responseType: 'json',
    })
      .then((response) => {
        const tlyUrlInfo = new TlyUrlInfo();
        tlyUrlInfo.originalUrl = tlyResponse.body.long_url;
        tlyUrlInfo.shortenUrl = tlyResponse.body.short_url;
        tlyUrlInfo.idString = tlyResponse.body.short_id;
        tlyUrlInfo.firstShortenId = response.body.idString;

        const urlInfo = new UrlInfo();
        urlInfo.originalUrl = tlyResponse.body.long_url;
        urlInfo.shortenUrl = response.body.shortURL;
        urlInfo.idString = response.body.idString;

        this.entityManager.transaction(async (transactionalEntityManager) => {
          await transactionalEntityManager.save(tlyUrlInfo);
          await transactionalEntityManager.save(urlInfo);
        });

        return response.body;
      })
      .catch((e) => {
        console.error('shorten fail', e.response.body);
        throw new HttpException(e.response.body, HttpStatus.BAD_REQUEST);
      });
  }
}
