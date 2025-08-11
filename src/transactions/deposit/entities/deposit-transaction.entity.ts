import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Deposit } from './deposit.entity';

import { TxType } from '../enums/tx-type.enum';
import { DecimalTransformer } from 'src/common/db/decimal.transformer';

@Entity('deposit_transactions')
export class DepositTransaction {
  @Column({ name: 'companyId' })
  companyId: number;

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Deposit, (d) => d.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deposit_id' })
  deposit: Deposit;

  @Column({ name: 'deposit_id' })
  depositId: number;

  @Column({ length: 20 })
  currency: string;

  @Column({
    name: 'transaction_type',
    type: 'enum',
    enum: TxType,
    default: TxType.BLOCKCHAIN,
  })
  transactionType: TxType;

  @Column({ length: 20 })
  type: string; // e.g. "deposit"

  @Column({ length: 128 })
  address: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  tag?: string;

  @Column('numeric', {
    precision: 36,
    scale: 18,
    transformer: new DecimalTransformer(),
  })
  amount: string;

  @Index({ unique: true })
  @Column({ length: 255 })
  txid: string;

  @Column('numeric', { precision: 10, scale: 2, default: 0 })
  riskscore: string;

  @Column({ type: 'int', default: 0 })
  confirmations: number;

  @CreateDateColumn()
  createdAt: Date;
}
