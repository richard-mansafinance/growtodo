import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty({
    description: 'Array of recipient email addresses',
    example: ['user@example.com', 'another@example.com'],
    type: [String],
  })
  @IsEmail({}, { each: true })
  recipients!: string[];

  @ApiProperty({
    description: 'Subject of the email',
    example: 'Welcome to Our App',
  })
  @IsString()
  subject!: string;

  @ApiProperty({
    description: 'HTML content of the email',
    example: '<p>Hello, this is your email content!</p>',
  })
  @IsString()
  html!: string;

  @ApiProperty({
    description: 'Plain text content of the email (optional)',
    example: 'Hello, this is your email content!',
    required: false,
  })
  @IsOptional()
  @IsString()
  text?: string;
}
