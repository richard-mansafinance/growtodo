import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: 'Email address of the admin',
    format: 'email',
  })
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @ApiProperty({
    example: 'StrongPass123',
    description: 'Password for the admin account (min. 5 characters)',
    minLength: 5,
  })
  @IsString()
  @MinLength(5, { message: 'Password must be at least 5 characters long' })
  password!: string;
}
