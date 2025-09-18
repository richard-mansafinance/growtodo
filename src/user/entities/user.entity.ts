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
import { Exclude, Expose } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @Expose()
  id!: number;

  @Index({ unique: true })
  @Column()
  @Expose()
  email!: string;

  @Exclude()
  @Column()
  password!: string;

  @OneToMany(() => Otp, (otp) => otp.user, { cascade: true })
  otps!: Otp[];

  @CreateDateColumn()
  @Expose()
  createdAt!: Date;

  @Column({ default: 'unverified' })
  @Expose()
  accountStatus!: 'unverified' | 'verified';

  @Exclude()
  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Optional, set when user is soft-deleted

  @Expose()
  @OneToMany(() => Todo, (todo) => todo.user, { nullable: true })
  todos?: Todo[] | null; // Explicitly allow null for safety
}
