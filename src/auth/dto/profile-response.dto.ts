import { ApiProperty } from '@nestjs/swagger';

class UserProfileResponse {
  @ApiProperty({ example: 'awesomeotinomz@gmail.com' })
  email!: string;
}

export class ProfileResponseDto {
  @ApiProperty({ example: 'Welcome to your profile' })
  message!: string;

  @ApiProperty({ type: () => UserProfileResponse })
  user!: UserProfileResponse;
}
