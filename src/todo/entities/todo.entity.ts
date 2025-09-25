import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Exclude, Expose, Type } from 'class-transformer';

@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  @Expose()
  id!: number;

  @Column()
  @Expose()
  title!: string;

  @Column({ nullable: true })
  @Expose()
  description!: string;

  @Column({ default: false })
  @Expose()
  completed!: boolean;

  @CreateDateColumn()
  @Expose()
  createdAt!: Date;

  @Exclude()
  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;

  @ManyToOne(() => User, (user) => user.todos) // Delete todos if user is deleted
  @Expose()
  @Type(() => User)
  user!: User;
}
