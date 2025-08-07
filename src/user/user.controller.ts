import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ description: 'User created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid credentials' })
  async register(@Body() userDto: UserDto) {
    return await this.userService.register(userDto);
  }

  //   @Post('forgot-password')
  //   async forgotPassword(@Body() forgotDto: RequestTokenDto) {
  //     const { email } = forgotDto;
  //     const user = await this.userService.findByEmail(email);
  //     if (!user) {
  //       throw new BadRequestException('User with this email does not exist');
  //     }

  //     // Logic to handle password reset token generation can be added here
  //   }
}
