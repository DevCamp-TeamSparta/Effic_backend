import {
  Controller,
  Logger,
  Post,
  Headers,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { BizmessageService } from '../service/bizmessage.service';
import { DefaultBizmessageDto } from '../dto/default-bizmessage.dto';
import { ImageUploadDto } from '../dto/image-upload.dto';
import * as jwt from 'jsonwebtoken';
import { UsersService } from 'src/users/service/users.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('bizmessage')
export class BizmessageController {
  private logger = new Logger('BizmessageController');
  constructor(
    private bizmessageService: BizmessageService,
    private readonly usersService: UsersService,
  ) {}

  // NCP에 이미지 업로드
  @Post('/image')
  @UseInterceptors(FileInterceptor('imageFile'))
  async uploadImage(
    @Headers('Authorization') authorization: string,
    @Body() imageUploadDto: ImageUploadDto,
    @UploadedFile() file,
  ) {
    this.logger.verbose('Image uploading');

    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);

    const email = decodedAccessToken.email;

    const user = await this.usersService.checkBizserviceId(email);

    return await this.bizmessageService.uploadImage(
      user.userId,
      file,
      imageUploadDto,
    );
  }

  // 기본 친구톡 보내기
  @Post('/default')
  async sendDefaultBizmessage(
    @Headers('Authorization') authorization: string,
    @Body() defaultBizmessageDto: DefaultBizmessageDto,
  ): Promise<object> {
    this.logger.verbose('Default bizmessage sending');

    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);

    const email = decodedAccessToken.email;

    const user = await this.usersService.checkBizserviceId(email);

    return await this.bizmessageService.sendDefaultBizmessage(
      user.userId,
      defaultBizmessageDto,
    );
  }

  // ab 친구톡 보내기
  // @Post('/abtest')
  // async sendAbTestBizmessage(@Headers('Authorization') authorization: string) {
  //   this.logger.verbose('AB test bizmessage sending');

  //   const accessToken = authorization.split(' ')[1];
  //   const decodedAccessToken: any = jwt.decode(accessToken);

  //   const email = decodedAccessToken.email;
  // }
}
