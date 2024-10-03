// src/auth/auth.controller

import { Controller, Get, Post, Body } from '@nestjs/common';
import { CryptoUtil } from '../common/crypto.util';
import { ApiResponseUtil } from '../common/api.response';
import { verifyIdNumber } from '../api/api';
import { TokenService } from './token.service';
import { UserService } from '../user/user.service';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestInfo } from '../database/entities/request_info.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly cryptoUtil: CryptoUtil,
    private readonly tokenService: TokenService,
    private readonly userService: UserService,

    @InjectRepository(RequestInfo)
    private readonly requestInfoRepository: Repository<RequestInfo>,
  ) {}

  @Get('login')
  async publicKey() {
    const publicKey = await this.cryptoUtil.getPublicKey();
    return ApiResponseUtil.success(200, {
      public_key: publicKey,
    });
  }

  @Post('login')
  async login(@Body() body) {
    const { id_number, password } = body;

    if (!id_number || !password) {
      return ApiResponseUtil.error(401, 'unauthorized', '需要传入参数');
    }

    try {
      const decryptedIdNumber = await this.cryptoUtil.decryptWithSM2(id_number);
      const decryptedPassword = await this.cryptoUtil.decryptWithSM2(password);

      if (!/^[0-9]{6}$/.test(decryptedPassword)) {
        return ApiResponseUtil.error(500, 'password_illegal', '密码不合法');
      }

      const existingUser =
        await this.userService.findByIdNumber(decryptedIdNumber);

      // 已注册用户
      if (existingUser) {
        const tokens = await this.tokenService.generateTokens(
          existingUser.uuid,
        );

        if (
          !(await this.userService.checkPassword(
            decryptedIdNumber,
            decryptedPassword,
          ))
        ) {
          return ApiResponseUtil.error(403, 'password_incorrect', '密码错误');
        }

        await this.tokenService.updateLastLogin(existingUser.uuid);

        return ApiResponseUtil.success(200, {
          type: 'login',
          tokens,
        });
      }

      // 未注册用户
      const apiResponse = await verifyIdNumber(decryptedIdNumber);

      if (apiResponse?.data?.outmap?.err === '身份证错误！') {
        return ApiResponseUtil.error(404, 'no_detected', '身份证不合法');
      }

      if (apiResponse?.data?.outmap?.err === 'success') {
        const userInfo = apiResponse.data.outmap.xs;

        const requestInfo = await this.requestInfoRepository.findOne({
          where: { profession_name: userInfo.zy },
        });

        const mainSubject = requestInfo ? requestInfo.subject : 0;

        const newUser = await this.userService.createUser(
          decryptedIdNumber,
          userInfo.xm,
          decryptedPassword,
          userInfo.xx,
          userInfo.zy,
          mainSubject,
        );

        const tokens = await this.tokenService.generateTokens(newUser.uuid);
        return ApiResponseUtil.success(200, {
          type: 'register',
          tokens,
        });
      }

      return ApiResponseUtil.error(500, 'unexpected_error', '未知错误');
    } catch (err) {
      return ApiResponseUtil.error(500, 'unexpected_error', err.message);
    }
  }

  @Post('refresh')
  async refresh(@Body() body) {
    const { refresh_token } = body;

    if (!refresh_token) {
      return ApiResponseUtil.error(
        400,
        'lack_refresh_token',
        '需要传入 Refresh Token',
      );
    }

    try {
      const newTokens = await this.tokenService.refreshTokens(refresh_token);

      return ApiResponseUtil.success(200, newTokens);
    } catch (err) {
      return ApiResponseUtil.error(401, 'Unauthorized', err.message);
    }
  }
}
