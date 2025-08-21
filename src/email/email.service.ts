import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { sendEmailDto } from './dto/email.dto';

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  createTransporter() {
    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    } as SMTPTransport.Options);
    return transporter;
  }

  async sendEmail(dto: sendEmailDto) {
    const { recipients, subject, html } = dto;
    const transporter = this.createTransporter();

    const options: nodemailer.SendMailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: recipients,
      subject,
      html,
    };
    try {
      await transporter.sendMail(options);
      console.log('Email sent successfully');
      return { message: 'Email sent successfully' };
    } catch (error: unknown) {
      throw new Error('Error sending email: ' + (error as Error).message);
    }
  }
}
