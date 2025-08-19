// src/auth/dto/login-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

class UserResponse {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'awesomeotinomz@gmail.com' })
  email!: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhd2Vzb21lb3Rpbm9tekBnbWFpbC5jb20iLCJpYXQiOjE3NTU1OTMzMDIsImV4cCI6MTc1NTU5NjkwMn0.bMc4NIOiqWLm496PKrPsIK90zh9hELB-vDGzoGEez8Y',
  })
  accessToken!: string;

  @ApiProperty({ type: () => UserResponse })
  user!: UserResponse;

  @ApiProperty({ example: 'Login successful' })
  message!: string;
}
