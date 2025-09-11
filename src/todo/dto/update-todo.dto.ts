import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class UpdateTodoDto {
  @ApiProperty({
    description: 'Unique identifier of the todo',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({
    description: 'Title of the todo',
    example: 'Finish NestJS project',
  })
  @Column()
  title!: string;

  @ApiProperty({
    description: 'Detailed description of the todo',
    example: 'Complete all endpoints and write documentation',
    required: false,
  })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Whether the todo is completed',
    example: false,
  })
  @Column({ default: false })
  completed!: boolean;

  @ApiProperty({
    description: 'Timestamp when the todo was created',
    example: '2025-09-11T10:25:35.870Z',
  })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({
    description: 'The user who owns this todo',
    example: {
      id: 7,
      email: 'richard@mansafinance.co',
      createdAt: '2025-09-04T06:00:36.781Z',
      accountStatus: 'unverified',
    },
  })
  @ManyToOne(() => User, (user) => user.todos)
  user!: User;
}
