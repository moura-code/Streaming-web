import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import * as zod from 'zod';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: zod.object({
        dbURL: zod.string().min(1),
      }),
      envFilePath: './apps/users/.env',
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}