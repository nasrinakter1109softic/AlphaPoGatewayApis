import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Withdrawal } from './withdrawal.entity';
import { DecimalTransformer } from '../../../common/db/decimal.transformer';
import { TxType } from 'src/transactions/deposit/enums/tx-type.enum';

@Entity('withdrawal_transactions')
export class WithdrawalTransaction {
  @Column({ name: 'companyId' })
  companyId: number;

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Withdrawal, (w) => w.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'withdrawal_id' })
  withdrawal: Withdrawal;

  @Column({ name: 'withdrawal_id' })
  withdrawalId: number;

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
  type: string; // e.g. "withdrawal"

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
  @Column({ type: 'varchar', length: 255, nullable: true })
  txid: string | null;

  @Column({ type: 'int', default: 0 })
  confirmations: number;

  @CreateDateColumn()
  createdAt: Date;
}
