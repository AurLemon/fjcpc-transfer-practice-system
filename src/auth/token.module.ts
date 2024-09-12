// /src/auth/token.module

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '../database/entities/token.entity';
import { TokenService } from './token.service';
import { User } from '../database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Token, User])],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
