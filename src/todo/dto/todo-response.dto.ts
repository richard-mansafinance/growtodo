import { ApiProperty } from '@nestjs/swagger';

export class TodoResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Buy groceries' })
  title!: string;

  @ApiProperty({ example: 'Milk, Eggs, Bread' })
  description?: string;

  @ApiProperty({ example: false })
  completed!: boolean;

  @ApiProperty({ example: '2025-09-04T10:00:00.000Z' })
  createdAt!: Date;
}
