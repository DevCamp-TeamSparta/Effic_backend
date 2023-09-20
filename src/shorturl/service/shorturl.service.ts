import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { tlyConfig, shortIoConfig } from 'config/short-io.config';
import { UrlInfosRepository } from '../shorturl.repository';
import { TlyUrlInfo, UrlInfo } from '../shorturl.entity';
import got from 'got';
import axios from 'axios';

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

  // 단축 url 결과 조회
  async getShorturlResult(idString: string) {
    try {
      const urlInfo = await this.urlInfosRepository.findOneByIdString(idString);
      if (!urlInfo) {
        throw new BadRequestException('idString is wrong');
      }
      const tlyResponse = await axios.get(
        'https://t.ly/api/v1/link/stats?short_url=' +
          urlInfo.tlyUrlInfo.shortenUrl,
        {
          headers: {
            Authorization: 'Bearer ' + tlyConfig.secretKey,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
      const totalClicks = tlyResponse.data.clicks || 0;
      const humanClicks = tlyResponse.data.unique_clicks || 0;
      return { totalClicks, humanClicks };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  // t.ly 결과 조회
  async getTlyInfo(idString: string) {
    try {
      const tlyResponse = await axios.get(
        'https://t.ly/api/v1/link/stats?short_url=' + idString,
        {
          headers: {
            Authorization: 'Bearer ' + tlyConfig.secretKey,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
      const totalClicks = tlyResponse.data.clicks || 0;
      const humanClicks = tlyResponse.data.unique_clicks || 0;
      return { totalClicks, humanClicks };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }
}
