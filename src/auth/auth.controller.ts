// src/auth/auth.controller

import { Controller, Get, Post, Body } from '@nestjs/common';
import { CryptoUtil } from '../common/crypto.util';
import { ApiResponseUtil } from '../common/api.response';
import { verifyIdNumber } from '../api/api';
import { TokenService } from './token.service';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly cryptoUtil: CryptoUtil,
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
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
      return ApiResponseUtil.error(401, 'Unauthorized', '需要传入参数');
    }

    try {
      // 使用 SM2 解密身份证号和密码
      const decryptedIdNumber = await this.cryptoUtil.decryptWithSM2(id_number);
      const decryptedPassword = await this.cryptoUtil.decryptWithSM2(password);

      // 校验密码合法性
      if (!/^[0-9]{6}$/.test(decryptedPassword)) {
        return ApiResponseUtil.error(500, 'password_illegal', '密码不合法');
      }

      // 在用户表中查找用户
      const existingUser =
        await this.userService.findByIdNumber(decryptedIdNumber);

      if (existingUser) {
        // 如果用户已存在，生成并返回 token
        const tokens = await this.tokenService.generateTokens(
          existingUser.uuid,
        );
        return ApiResponseUtil.success(200, {
          type: 'login',
          tokens,
        });
      }

      // 调用 API 验证身份证号
      const apiResponse = await verifyIdNumber(decryptedIdNumber);

      // 如果身份证号不合法
      if (apiResponse?.data?.outmap?.err === '身份证错误！') {
        return ApiResponseUtil.error(404, 'no_detected', '身份证不合法');
      }

      // 如果 API 验证通过，说明身份证号正确
      if (apiResponse?.data?.outmap?.err === 'success') {
        const userInfo = apiResponse.data.outmap.xs;

        // 使用 UserService 创建新用户并保存到数据库
        const newUser = await this.userService.createUser(
          decryptedIdNumber,
          userInfo.xm, // 用户名
          decryptedPassword, // 解密后的密码
          userInfo.xx, // 学校
          userInfo.zy, // 专业
        );

        // 生成并返回 token
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
