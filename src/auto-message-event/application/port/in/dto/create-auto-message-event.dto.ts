import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  isNotEmpty,
} from 'class-validator';

export class CreateAutoMessageEventDto {
  @IsString()
  @IsNotEmpty()
  autoMessageEventName: string;

  /**AME 실행 시간 */

  /**AME 종료 예정일 */
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  scheduledEndDate?: Date;

  /**AME 생성 날짜 */
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  createdDate: Date;

  /**AME 활성화 유무 */
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  /**Token에서 추출한 email */
  @IsString()
  @IsOptional()
  email?: string;

  /**AME의 세그먼트 정보 */
  @IsNumber()
  @IsNotEmpty()
  segmentId: number;

  /**사용자가 입력한 데이터들 */

  /**AME에 사용된 고객 DB 정보 */

  /**통계 관련 컬럼 */
  @IsNumber()
  @IsOptional()
  totalSentCount?: number | null;

  /**통계 관련 컬럼 */
  @IsNumber()
  @IsOptional()
  clickCount?: number | null;

  /**통계 관련 컬럼 */
  @IsNumber()
  @IsOptional()
  clickRate?: number | null;
}
