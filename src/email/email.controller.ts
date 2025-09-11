import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiTags,
} from '@nestjs/swagger';
import { sendEmailDto } from './dto/email.dto';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send an email' })
  @ApiCreatedResponse({
    description: 'Email sent successfully',
    type: Object,
  })
  @ApiBadRequestResponse({
    description: 'Failed to send email. Invalid payload or SMTP error',
  })
  async sendEmail(@Body() dto: sendEmailDto): Promise<{ message: string }> {
    await this.emailService.sendEmail(dto);
    return { message: 'Email sent successfully' };
  }
}
