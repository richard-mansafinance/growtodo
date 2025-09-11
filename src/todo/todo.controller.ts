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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { Todo } from './entities/todo.entity';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { plainToInstance } from 'class-transformer';

@ApiTags('Todos') // Groups all endpoints under "Todos" in docs
@ApiBearerAuth() // Adds JWT bearer auth requirement in docs
@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new todo for a user' })
  @ApiBody({ type: CreateTodoDto })
  @ApiResponse({
    status: 201,
    description: 'Todo successfully created',
    type: Todo,
  })
  async createTodo(
    @Body() createTodoDto: CreateTodoDto & { userId: number },
  ): Promise<Todo> {
    const todo = await this.todoService.createTodo(
      createTodoDto.userId,
      createTodoDto,
    );
    return plainToInstance(Todo, todo, {
      excludeExtraneousValues: true,
    }) as Todo;
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all todos for a specific user' })
  @ApiResponse({ status: 200, description: 'List of user todos', type: [Todo] })
  async getTodosByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Todo[]> {
    return this.todoService.getTodosByUserId(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a todo by ID' })
  @ApiBody({ type: UpdateTodoDto })
  @ApiResponse({
    status: 200,
    description: 'Todo successfully updated',
    type: Todo,
  })
  async updateTodo(
    @Param('id', ParseIntPipe) todoId: number,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<Todo> {
    return this.todoService.updateTodo(todoId, updateTodoDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a todo by ID' })
  @ApiResponse({ status: 200, description: 'Todo successfully deleted' })
  async deleteTodo(
    @Param('id', ParseIntPipe) todoId: number,
  ): Promise<{ message: string }> {
    return this.todoService.deleteTodo(todoId);
  }
}
