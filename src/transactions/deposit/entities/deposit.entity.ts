import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CryptoAddress } from './crypto-address.entity';
import { DepositStatus } from '../enums/deposit-status.enum';
import { DecimalTransformer } from 'src/common/db/decimal.transformer';
import { DepositTransaction } from './deposit-transaction.entity';
import { DepositFee } from './deposit-fee.entity';

@Entity('deposits')
export class Deposit {
  @Column({ name: 'companyId' })
  companyId: number;

  @PrimaryGeneratedColumn()
  id: number;

  /** "deposit" | "invoice" | etc. */
  @Column({ length: 20 })
  type: string;

  @ManyToOne(() => CryptoAddress, (a) => a.deposits, { eager: true })
  @JoinColumn({ name: 'crypto_address_id' })
  cryptoAddress: CryptoAddress;

  @Column({ name: 'crypto_address_id' })
  cryptoAddressId: number;

  @Column({ name: 'currency_sent', length: 20 })
  currencySent: string;

  @Column('numeric', {
    precision: 36,
    scale: 18,
    transformer: new DecimalTransformer(),
    name: 'amount_sent',
  })
  amountSent: string; // 6.53157512

  @Column({ name: 'currency_received', length: 20 })
  currencyReceived: string;

  @Column('numeric', {
    precision: 36,
    scale: 18,
    transformer: new DecimalTransformer(),
    name: 'amount_received',
  })
  amountReceived: string; // 6.53157512

  @Column('numeric', {
    precision: 36,
    scale: 18,
    transformer: new DecimalTransformer(),
    name: 'amount_minus_fee',
  })
  amountMinusFee: string; // 6.5119800

  @Column({ type: 'enum', enum: DepositStatus, default: DepositStatus.PENDING })
  status: DepositStatus;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @OneToMany(() => DepositTransaction, (t) => t.deposit, {
    cascade: ['insert'],
  })
  transactions: DepositTransaction[];

  @OneToMany(() => DepositFee, (f) => f.deposit, { cascade: ['insert'] })
  fees: DepositFee[];

  /** keep raw callback for audit/debug */
  @Column({ type: 'jsonb', nullable: true })
  raw: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
