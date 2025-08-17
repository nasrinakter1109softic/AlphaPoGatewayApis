import { Company } from 'src/company/entity/company.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('balances')
export class Balance {
  @PrimaryGeneratedColumn()
  balanceId: number;

  @Column()
  currency: string;

  @Column({
    type: 'decimal',
    precision: 18, 
    scale: 8,
    default: 0,
    transformer: {
      to: (value: number): string => value.toString(),
      from: (value: string): number => Number(value), 
    },
  })
  balance: number;

  @ManyToOne(() => Company, (company) => company.balances)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ nullable: true })
  companyId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
