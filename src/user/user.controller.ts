// src/user/user.controller

import { Controller, Get, Post } from '@nestjs/common';

@Controller('user')
export class AuthController {
  @Get('profile')
  async userProfile() {}

  @Get('progress')
  async userProgress() {}

  @Post('star')
  async userStar() {}

  @Post('setting')
  async userSetting() {}
}
