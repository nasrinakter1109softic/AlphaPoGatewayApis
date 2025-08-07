import { CryptoAddress } from 'src/transactions/deposit/entities/crypto-address.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  OneToMany,
} from 'typeorm';

@Entity('currencies')
@Unique(['currency'])
export class CurrencyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  currency: string;

  @Column()
  type: string; // 'crypto' | 'fiat'

  @Column('decimal', { precision: 18, scale: 8 })
  minimum_amount: string;

  @Column('decimal', { precision: 5, scale: 2 })
  deposit_fee_percent: string;

  @Column('decimal', { precision: 5, scale: 2 })
  withdrawal_fee_percent: string;

  @Column()
  precision: number;

  @Column({ default: true })
  visible: boolean;

  @OneToMany(() => CryptoAddress, (address) => address.currencyEntity)
  cryptoAddresses: CryptoAddress[];
}
