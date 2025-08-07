import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class UserDto {
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
}
