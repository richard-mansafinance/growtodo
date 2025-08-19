// src/auth/entities/blacklisted-token.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class BlacklistedToken {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ unique: true })
  token?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column()
  expiresAt?: Date;
}
