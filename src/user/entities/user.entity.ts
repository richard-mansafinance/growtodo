import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Otp } from '../../otp/entity/otp.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @OneToMany(() => Otp, (otp) => otp.user, { cascade: true })
  otps!: Otp[];
}
