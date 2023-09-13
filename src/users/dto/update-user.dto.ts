import { IsOptional, IsString, IsArray, IsBoolean } from 'class-validator';
export class UpdateUserDto {
  @IsArray()
  @IsOptional()
  hostnumber?: string[];

  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  advertisementOpt?: boolean;

  @IsString()
  @IsOptional()
  accessKey?: string;

  @IsString()
  @IsOptional()
  serviceId?: string;

  @IsString()
  @IsOptional()
  secretKey?: string;

  @IsArray()
  @IsOptional()
  advertiseNumber?: string[];
}
