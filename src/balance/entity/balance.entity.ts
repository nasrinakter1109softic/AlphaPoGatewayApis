import { Company } from 'src/company/entity/company.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity('balances')
export class Balance {
  @PrimaryGeneratedColumn()
  balanceId: number;

  @Column({ length: 3 })
  currency: string;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 4,
    default: 0,
  })
  balance: number;

  @ManyToOne(() => Company, (company) => company.balances)
  company: Company;

  @Column({nullable: true})
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
