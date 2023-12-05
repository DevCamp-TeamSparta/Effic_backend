import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SegmentOrmEntity } from './segment.orm.entity';
import { Segment } from 'src/segment/domain/segment';
import { SegmentMapper } from './segment.mapper';
import { ISegmentPort } from 'src/segment/application/port/out/segment.port';

@Injectable()
export class SegmentRepository implements ISegmentPort {
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

  async getSegmentDetails(segmentId: number): Promise<Segment> {
    const segmentOrmEntity = await this.segmentRepository.findOneBy({
      id: segmentId,
    });
    if (!segmentOrmEntity) throw new Error('Segment not found');

    const segment = SegmentMapper.mapToUserQuery(segmentOrmEntity);

    return segment;
  }

  // async updateSegmentQuery(
  //   segmentId: number,
  //   segmentQuery: string,
  // ): Promise<void> {}

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
