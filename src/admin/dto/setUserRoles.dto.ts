import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetUserRolesDto {
  @ApiProperty({
    example: 'admin',
    description:
      'Role to assign to the user. Must be either "admin" or "user".',
    enum: ['admin', 'user'],
  })
  @IsIn(['admin', 'user'], {
    message: 'Roles must be either "admin" or "user"',
  })
  roles!: 'admin' | 'user';
}
