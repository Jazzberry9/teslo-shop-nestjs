import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    ConfigModule,

    TypeOrmModule.forFeature([ User ]),

    PassportModule.register({
      defaultStrategy: 'jwt'
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Otra manera de obtener los environment
        // console.log('jwt-secretooo', configService.get('JWT_SECRET'));
        // console.log('jwt-secret', process.env.JWT_SECRET);
        return {
          signOptions: { expiresIn: '1h'},
          secret: process.env.JWT_SECRET
        }
      }
    })
        // JwtModule.register({
        //   signOptions: { expiresIn: '1h'},
        //   privateKey: process.env.JWT_SECRET
        // })
  ],
  exports: [TypeOrmModule, AuthService, JwtStrategy, PassportModule, JwtModule]
})
export class AuthModule {}