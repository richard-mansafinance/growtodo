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
import { Todo } from '../../todo/entities/todo.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column()
  email!: string;

  @Exclude()
  @Column()
  password!: string;

  @OneToMany(() => Otp, (otp) => otp.user, { cascade: true })
  otps!: Otp[];

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ default: 'unverified' })
  accountStatus!: 'unverified' | 'verified';

  @Exclude()
  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Optional, set when user is soft-deleted

  @OneToMany(() => Todo, (todo) => todo.user, { nullable: true })
  todos?: Todo[] | null; // Explicitly allow null for safety
}
