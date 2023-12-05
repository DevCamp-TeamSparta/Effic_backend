import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICreateSegmentPort } from 'src/segment/application/port/out/create-segment.port';
import { SegmentOrmEntity } from './segment.orm.entity';
import { Segment } from 'src/segment/domain/segment';
import { SegmentMapper } from './segment.mapper';

@Injectable()
export class SegmentRepository implements ICreateSegmentPort {
  constructor(
    @InjectRepository(SegmentOrmEntity)
    private readonly segmentRepository: Repository<SegmentOrmEntity>,
  ) {}

  async saveSegmentToEfficDB(segment: Segment): Promise<SegmentOrmEntity> {
    const segmentOrmEntity = SegmentMapper.mapToSegmentOrmEntity(segment);

    const savedSegmentOrmEntity = await this.segmentRepository.save(
      segmentOrmEntity,
    );
    return savedSegmentOrmEntity;
  }

  // async getUserQueryFromEfficDB(uuid: string): Promise<UserQuery> {
  //   console.log(uuid);
  //   const userQueryOrmEntity = await this.userQueryRepository.findOneBy({
  //     uuid,
  //   });

  //   const userQueryOrmEntity2 = await this.userQueryRepository.find();

  //   console.log(userQueryOrmEntity2);

  //   if (!userQueryOrmEntity) {
  //     throw new Error('UserQuery not found');
  //   }

  //   return UserQueryMapper.mapToUserQuery(userQueryOrmEntity);
  // }

  // excuteUserQueryToTargetDB(userQuery: UserQuery) {
  //   // 입력받은 userQuery를 TargetDB에서 실행
  //   // 실행 결과를 return
  // }
}
