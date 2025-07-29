import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DecimalTransformer } from '../../../common/db/decimal.transformer';

import { WithdrawalStatus } from '../enums/withdrawal-status.enum';
import { CryptoAddress } from 'src/transactions/deposit/entities/crypto-address.entity';
import { WithdrawalTransaction } from './withdrawal-transaction.entity';
import { WithdrawalFee } from './withdrawal-fee.entity';

@Entity('withdrawals')
export class Withdrawal {
  @PrimaryGeneratedColumn()
  id: number;

  /** client side generated to correlate request <-> callback */
  @Index({ unique: true })
  @Column({ name: 'request_id', length: 64 })
  requestId: string;

  /** who requested (optional, if you keep users) */
  @Column({ type: 'varchar', name: 'foreign_id', length: 128, nullable: true })
  foreignId: string | null;

  @Column({ length: 20 })
  currency: string;

  /** amount user/merchant wants to send (before fee) */
  @Column('numeric', {
    precision: 36,
    scale: 18,
    transformer: new DecimalTransformer(),
    name: 'amount_from',
  })
  amountFrom: string;

  /** final amount user will receive (after fee / maybe after exchange) */
  @Column('numeric', {
    precision: 36,
    scale: 18,
    transformer: new DecimalTransformer(),
    name: 'amount_to',
    nullable: true,
  })
  amountTo: string | null;

  /** destination address/tag */
  @Column({ length: 128 })
  toAddress: string;

  @Column({ type: 'varchar', nullable: true, length: 128 })
  toTag?: string | null;

  @ManyToOne(() => CryptoAddress, { nullable: true })
  @JoinColumn({ name: 'from_crypto_address_id' })
  fromCryptoAddress?: CryptoAddress;

  @Column({ name: 'from_crypto_address_id', nullable: true })
  fromCryptoAddressId?: number | null;

  @Column({
    type: 'enum',
    enum: WithdrawalStatus,
    default: WithdrawalStatus.REQUESTED,
  })
  status: WithdrawalStatus;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @OneToMany(() => WithdrawalTransaction, (t) => t.withdrawal, {
    cascade: ['insert'],
  })
  transactions: WithdrawalTransaction[];

  @OneToMany(() => WithdrawalFee, (f) => f.withdrawal, { cascade: ['insert'] })
  fees: WithdrawalFee[];

  /** raw callback/request for audit */
  @Column({ type: 'jsonb', nullable: true })
  raw: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
