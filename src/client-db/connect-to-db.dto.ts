import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ConnectToDatabaseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  host: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  user: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  database: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  port: number;
}
