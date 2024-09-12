// src/auth/auth.module

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { TokenModule } from './token.module';
import { CryptoModule } from '../common/crypto.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User]), TokenModule, CryptoModule],
  controllers: [AuthController],
  providers: [UserService],
})
export class AuthModule {}
