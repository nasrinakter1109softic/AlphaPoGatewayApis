import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Withdrawal } from './withdrawal.entity';
import { DecimalTransformer } from '../../../common/db/decimal.transformer';

@Entity('withdrawal_fees')
export class WithdrawalFee {
  @Column({ name: 'companyId' })
  companyId: number;

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Withdrawal, (w) => w.fees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'withdrawal_id' })
  withdrawal: Withdrawal;

  @Column({ name: 'withdrawal_id' })
  withdrawalId: number;

  @Column({ length: 32 })
  type: string; // e.g. "withdrawal", "network"

  @Column({ length: 20 })
  currency: string;

  @Column('numeric', {
    precision: 36,
    scale: 18,
    transformer: new DecimalTransformer(),
  })
  amount: string;

  @CreateDateColumn()
  createdAt: Date;
}
