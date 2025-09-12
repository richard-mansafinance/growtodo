import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class RequestTokenDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'richard@mansafinance.co',
  })
  @IsString()
  @IsEmail()
  email!: string;
}
