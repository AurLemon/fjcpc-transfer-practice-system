import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';

import { User } from './database/entities/user.entity';
import { Token } from './database/entities/token.entity';
import { LoginKey } from './database/entities/login_key.entity';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const dbType = configService.get<string>('database.type');
        if (dbType === 'sqlite') {
          return {
            type: 'sqlite',
            database: configService.get<string>('database.sqlitePath'),
            entities: [User, Token, LoginKey],
            synchronize: true,
          };
        } else if (dbType === 'mysql') {
          return {
            type: 'mysql',
            host: configService.get<string>('database.host'),
            port: configService.get<number>('database.port'),
            username: configService.get<string>('database.user'),
            password: configService.get<string>('database.password'),
            database: configService.get<string>('database.name'),
            entities: [User, Token, LoginKey],
            synchronize: true,
          };
        }
      },
    }),
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
