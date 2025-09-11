import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { User } from '../user/entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Todo, User]), AuthModule],
  providers: [TodoService],
  controllers: [TodoController],
})
export class TodoModule {}
