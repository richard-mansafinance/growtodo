import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTodoDto {
  @ApiProperty({
    description: 'The title of the todo',
    example: 'Go for a 30-minute run',
  })
  @IsString()
  title!: string;

  @ApiPropertyOptional({
    description: 'Additional details about the todo',
    example: 'Remember to take water along',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
