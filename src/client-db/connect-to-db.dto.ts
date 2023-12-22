import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ConnectToDatabaseDto {
  @IsString()
  @IsNotEmpty()
  host: string;

  @IsString()
  @IsNotEmpty()
  user: string;

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
