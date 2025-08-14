import { CryptoAddress } from '@/transactions/deposit/entities/crypto-address.entity';
import { Balance } from 'src/balance/entity/balance.entity';
import { CompanyStatus } from 'src/common/enums/company-status';
import { Deposit } from 'src/transactions/deposit/entities/deposit.entity';
import { Withdrawal } from 'src/transactions/withdraw/entities/withdrawal.entity';
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

  @Column({ unique: true, nullable: true })
  phone?: string | null;

  @Column()
  country: string;

  @Column()
  businessName: string;

  @Column({ nullable: true })
  approvedBy: number;

  @Column({ default: CompanyStatus.PENDING })
  status: string;

  @Column({ default: false })
  isOtpVerified: boolean;

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

  @OneToMany(() => CryptoAddress, (address) => address.company)
  cryptoAddresses: CryptoAddress[];

  @OneToMany(() => Withdrawal, (withdrawal) => withdrawal.company)
  withdrawals: Withdrawal[];

  @OneToMany(() => Deposit, (deposit) => deposit.company)
  deposits: Deposit[];

  @OneToOne(() => User, (user) => user.company)
  @JoinColumn()
  user: User;

  @OneToMany(() => Balance, (balance) => balance.company)
  balances: Balance[];

  @Column({ type: 'timestamp', default: () => 'now()' }) //
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'now()' }) //
  updatedAt: Date;
}
