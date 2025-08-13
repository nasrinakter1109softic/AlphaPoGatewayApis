import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Deposit } from './deposit.entity';
import { CurrencyEntity } from 'src/currency/entities/currency.entity';
import { Company } from '@/company/entity/company.entity';

@Entity('crypto_addresses')
export class CryptoAddress {
  @Column({ name: 'companyId' })
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

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Deposit, (d) => d.cryptoAddress)
  deposits: Deposit[];

  // Defining the relationship to Company (Many-to-One)
  @ManyToOne(() => Company, (company) => company.cryptoAddresses, {
    nullable: true,
  })
  @JoinColumn({ name: 'companyId' }) // Foreign key column
  company: Company; // This represents the related company

  @ManyToOne(() => CurrencyEntity, (currency) => currency.cryptoAddresses)
  @JoinColumn({ name: 'currency', referencedColumnName: 'currency' })
  currencyEntity: CurrencyEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
