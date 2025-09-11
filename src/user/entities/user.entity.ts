import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { Otp } from '../../otp/entity/otp.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column()
  email!: string;

  @Column()
  password!: string;

  @OneToMany(() => Otp, (otp) => otp.user, { cascade: true })
  otps!: Otp[];

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ default: 'unverified' })
  accountStatus!: 'unverified' | 'verified';

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date; // Optional, set when user is soft-deleted
}
