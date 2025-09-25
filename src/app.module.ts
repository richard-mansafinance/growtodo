import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { OtpModule } from './otp/otp.module';
import { TodoModule } from './todo/todo.module';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { BlacklistedToken } from './auth/entities/blacklisted-token.entity';
import { Otp } from './otp/entity/otp.entity';
import { Todo } from './todo/entities/todo.entity';
import { AdminModule } from './admin/admin.module';

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'),
  entities: [User, BlacklistedToken, Otp, Todo],
  synchronize: true,
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the configuration available globally
    }),
    TypeOrmModule.forRootAsync({
      imports: [EmailModule, ConfigModule],
      useFactory: typeOrmConfig,
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    AdminModule,
    EmailModule,
    OtpModule,
    TodoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
