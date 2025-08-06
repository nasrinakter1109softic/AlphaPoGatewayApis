import { Balance } from 'src/balance/entity/balance.entity';
import { User } from 'src/user/entity/user.entity'; // Correct the path
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  companyId: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phone: string;

  @Column()
  country: string;

  @Column()
  businessName: string;

  @Column({ nullable: true })
  kycDocument?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ default: false })
  softDelete: boolean;

  @Column({ default: false })
  isAdminCreated: boolean;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 4,
    default: 0,
  })
  commission_rate: number;

  @OneToOne(() => User, (user) => user.company)
  @JoinColumn()
  user: User;

  @OneToMany(() => Balance, (balance) => balance.company)
  balances: Balance[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
