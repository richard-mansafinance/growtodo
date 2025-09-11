import { IsOptional, IsString } from 'class-validator';

export class CreateTodoDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
