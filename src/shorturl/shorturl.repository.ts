import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { UrlInfo } from './shorturl.entity';

@Injectable()
export class UrlInfosRepository extends Repository<UrlInfo> {
  constructor(private datasource: DataSource) {
    super(UrlInfo, datasource.createEntityManager());
  }

  async findOneByIdString(idString: string): Promise<UrlInfo> {
    return await this.findOne({
      where: { idString },
      relations: {
        tlyUrlInfo: true,
      },
    });
  }
}
