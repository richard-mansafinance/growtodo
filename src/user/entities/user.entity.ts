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
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id!: string;

  @Index({ unique: true })
  @Column()
  @Expose()
  email!: string;

  @Exclude()
  @Column()
  password!: string;

  @OneToMany(() => Otp, (otp) => otp.user)
  otps!: Otp[];

  @CreateDateColumn()
  @Expose()
  createdAt!: Date;

  @Column({ default: 'unverified' })
  @Expose()
  accountStatus!: 'unverified' | 'verified';

  @Exclude()
  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;

  @OneToMany(() => Todo, (todo) => todo.user)
  @Expose()
  todos?: Todo[];

  @Exclude()
  @Column({ default: 'user' })
  roles!: 'admin' | 'user';
}
