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
  @Column({ name: 'companyId' })
  companyId: number;

  @PrimaryGeneratedColumn()
  id: number;

  // eslint-disable-next-line prettier/prettier
  @ManyToOne(() => Deposit, (d) => d.fees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'depositId' })
  deposit: Deposit;

  @Column({ name: 'depositId' })
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
