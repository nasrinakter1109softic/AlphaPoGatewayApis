import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Deposit } from './deposit.entity';
import { DecimalTransformer } from 'src/common/db/decimal.transformer';

@Entity('deposit_fees')
export class DepositFee {
  @Column({ name: 'company_id' })
  companyId: number;

  @PrimaryGeneratedColumn()
  id: number;

  // eslint-disable-next-line prettier/prettier
  @ManyToOne(() => Deposit, (d) => d.fees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deposit_id' })
  deposit: Deposit;

  @Column({ name: 'deposit_id' })
  depositId: number;

  @Column({ length: 32 })
  type: string; // e.g. "deposit"

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
