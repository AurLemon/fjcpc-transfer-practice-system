import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { CryptoModule } from '../common/crypto.module';

@Module({
  imports: [CryptoModule],
  controllers: [AuthController],
})
export class AuthModule {}
