import { ApiProperty } from '@nestjs/swagger';
import { TodoResponseDto } from '../../todo/dto/todo-response.dto';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'richard@mansafinance.co' })
  email!: string;

  @ApiProperty({ example: '2025-09-04T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({
    type: [TodoResponseDto],
    required: false,
    description: 'List of user todos (optional)',
  })
  todos?: TodoResponseDto[] | null;
}
