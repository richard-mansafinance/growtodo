import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';
import { IsNull, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Create a new todos
  async createTodo(
    userId: string,
    createTodoDto: CreateTodoDto,
  ): Promise<Todo> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId, deletedAt: IsNull() },
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      const todo = this.todoRepository.create({
        ...createTodoDto,
        user,
      });
      return await this.todoRepository.save(todo);
    } catch (error: unknown) {
      throw error instanceof BadRequestException
        ? error
        : new InternalServerErrorException('Failed to create todo');
    }
  }

  //   Get all todos for a user
  async getTodosByUserId(userId: string): Promise<Todo[]> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId, deletedAt: IsNull() },
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      return await this.todoRepository.find({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' }, // Sort by createdAt, most recent first
      });
    } catch (error: unknown) {
      throw error instanceof BadRequestException
        ? error
        : new InternalServerErrorException('Failed to retrieve todo');
    }
  }

  //   Update a todo by ID
  async updateTodo(
    todoId: number,
    updateTodoDto: UpdateTodoDto,
  ): Promise<Todo> {
    try {
      const todo = await this.todoRepository.findOne({
        where: { id: todoId },
        relations: ['user'],
      });
      if (!todo) {
        throw new BadRequestException('Todo not found');
      }
      Object.assign(todo, updateTodoDto);
      return await this.todoRepository.save(todo);
    } catch (error: unknown) {
      console.error('Error updating todo:', error);
      throw error instanceof BadRequestException ||
        error instanceof ForbiddenException
        ? error
        : new InternalServerErrorException('Failed to update todo');
    }
  }

  //   Delete a todo by ID
  async deleteTodo(todoId: number): Promise<{ message: string }> {
    try {
      const todo = await this.todoRepository.findOne({
        where: { id: todoId },
        relations: ['user'],
      });
      if (!todo) {
        throw new BadRequestException('Todo not found');
      }
      await this.todoRepository.softDelete(todoId);
      return { message: 'Task deleted successfully' };
    } catch (error: unknown) {
      console.error('Error updating todo:', error);
      throw error instanceof BadRequestException ||
        error instanceof ForbiddenException
        ? error
        : new InternalServerErrorException('Failed to update todo');
    }
  }
}
