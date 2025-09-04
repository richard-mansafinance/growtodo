import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'johndo@gmail.com',
    required: true,
  })
  @IsString()
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'User password',
    example: 'testpass000',
    required: true,
  })
  @IsString()
  password!: string;

  @IsOptional()
  @IsString()
  otp?: string;
}
