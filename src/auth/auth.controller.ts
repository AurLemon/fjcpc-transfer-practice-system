import { Controller, Get, Post, Body } from '@nestjs/common';
import { CryptoUtil } from '../common/crypto.util';
import { ApiResponseUtil } from '../common/api.response';

@Controller('auth')
export class AuthController {
  constructor(private readonly cryptoUtil: CryptoUtil) {}

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

      return ApiResponseUtil.success(200, {
        decryptedIdNumber,
        decryptedPassword,
      });
    } catch (err) {
      return ApiResponseUtil.error(
        500,
        'decryption_error',
        '解密失败或其他错误：' + err,
      );
    }
  }
}
