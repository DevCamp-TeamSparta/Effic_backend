import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IClientDbPort } from './client-db.port';
import { ClientDbOrmEntity } from './client-db.orm.entity';
import { Repository } from 'typeorm';
import { ConnectToDatabaseDto } from './connect-to-db.dto';

@Injectable()
export class ClinetDbRepository implements IClientDbPort {
  constructor(
    @InjectRepository(ClientDbOrmEntity)
    private readonly clientDbRepository: Repository<ClientDbOrmEntity>,
  ) {}

  async saveClientDbInfo(dto: ConnectToDatabaseDto) {
    const { host, user, password, database, port } = dto;

    const ClientDbOrmEntity = {
      host,
      user,
      password,
      database,
      port,
    };

    const savedClientDbOrmEntity = await this.clientDbRepository.save(
      ClientDbOrmEntity,
    );
    return savedClientDbOrmEntity;
  }
}
