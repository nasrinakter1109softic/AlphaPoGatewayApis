import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Deposit } from './deposit.entity';

@Entity('crypto_addresses')
export class CryptoAddress {
  @Column({ name: 'company_id' })
  companyId: number;

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  currency: string;

  @Index({ unique: true })
  @Column({ length: 128 })
  address: string;

  @Column({ type: 'varchar', nullable: true, length: 128 })
  tag?: string | null;

  @Index()
  @Column({ name: 'foreign_id', length: 128 })
  foreignId: string;

  @OneToMany(() => Deposit, (d) => d.cryptoAddress)
  deposits: Deposit[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
