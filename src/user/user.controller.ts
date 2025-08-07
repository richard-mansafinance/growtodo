import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  async register(@Body() userDto: UserDto) {
    return await this.userService.register(userDto);
  }

  @Delete('delete/:id')
  async deleteUser(@Param('id', ParseIntPipe) userId: number): Promise<void> {
    await this.userService.deleteUser(userId);
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
