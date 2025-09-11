import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { Todo } from './entities/todo.entity';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { plainToInstance } from 'class-transformer';

@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  // Create a new todo for a user
  @UseGuards(JwtAuthGuard)
  @Post()
  async createTodo(
    @Body() createTodoDto: CreateTodoDto & { userId: number },
  ): Promise<Todo> {
    // return this.todoService.createTodo(createTodoDto.userId, createTodoDto);
    const todo = await this.todoService.createTodo(
      createTodoDto.userId,
      createTodoDto,
    );
    if (!todo || todo instanceof Error) {
      throw new Error('Failed to create todo');
    }
    return plainToInstance(Todo, todo, {
      excludeExtraneousValues: true,
    }) as Todo;
  }

  // Get all todos for a specific user
  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getTodosByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Todo[]> {
    return this.todoService.getTodosByUserId(userId);
  }

  // Update a todo by ID
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateTodo(
    @Param('id', ParseIntPipe) todoId: number,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<Todo> {
    return this.todoService.updateTodo(todoId, updateTodoDto);
  }

  // Delete a todo by ID
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteTodo(
    @Param('id', ParseIntPipe) todoId: number,
  ): Promise<{ message: string }> {
    return this.todoService.deleteTodo(todoId);
  }
}
