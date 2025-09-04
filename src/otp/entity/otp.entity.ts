import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { OTPType } from '../types/otpType';

@Entity()
export class Otp {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.otps, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user!: User;

  @Column()
  token!: string; // hashed otp for verification or reset token for password

  @Column({ type: 'enum', enum: OTPType })
  type!: OTPType;

  @CreateDateColumn()
  createdAt!: Date;

  @Column()
  expiresAt!: Date;
}
