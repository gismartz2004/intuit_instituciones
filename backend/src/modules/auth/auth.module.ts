

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from '../../database/database.module';
import { StudentModule } from '../student/student.module';

import { JwtStrategy } from './jwt.strategy';

@Module({
    imports: [
        DatabaseModule,
        StudentModule,
        PassportModule,
        JwtModule.register({
            secret: 'SECRET_KEY_DEV_ONLY', // TODO: Move to env
            signOptions: { expiresIn: '60m' },
        }),
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }

