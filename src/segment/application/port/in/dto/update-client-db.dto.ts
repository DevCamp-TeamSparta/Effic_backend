import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateClientDbDto {
  @IsNumber()
  @IsNotEmpty()
  segmentId: number;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  host: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  database: string;

  @IsNumber()
  @IsNotEmpty()
  port: number;
}
