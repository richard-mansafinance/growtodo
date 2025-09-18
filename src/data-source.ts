import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
// import { User } from './user/entities/user.entity';
// import { Todo } from './todo/entities/todo.entity';
// import { Otp } from './otp/entity/otp.entity';
// import { BlacklistedToken } from './auth/entities/blacklisted-token.entity';

dotenv.config();

export const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE,
  //   entities: [User, Todo, Otp, BlacklistedToken],
  entities: [__dirname + '/**/*.entity{.ts,.js}'],

  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
