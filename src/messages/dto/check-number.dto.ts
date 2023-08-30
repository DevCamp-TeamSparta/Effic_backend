import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CheckHostNumberDto {
  @IsNotEmpty()
  @IsString()
  hostnumber: string;

  @IsNotEmpty()
  @IsString()
  accessKey: string;

  @IsNotEmpty()
  @IsString()
  secretKey: string;

  @IsNotEmpty()
  @IsString()
  serviceId: string;

  @IsNotEmpty()
  @IsBoolean()
  advertiseInfo: boolean;
}
