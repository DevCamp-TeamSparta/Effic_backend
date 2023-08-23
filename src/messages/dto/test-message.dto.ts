import { PartialType } from '@nestjs/mapped-types';
import { DefaultMessageDto } from './default-message.dto';

export class TestMessageDto extends PartialType(DefaultMessageDto) {}
