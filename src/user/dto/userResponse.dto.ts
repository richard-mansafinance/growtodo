import { Todo } from '../../todo/entities/todo.entity';

export class UserResponseDto {
  id!: number;
  email!: string;
  createdAt!: Date;
  todos?: Todo[] | null;
}
