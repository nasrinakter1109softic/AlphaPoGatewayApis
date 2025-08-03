import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserType } from 'src/common/enums/user-type.enum';
import { UserStatus } from 'src/common/enums/user-status';
import { Roles } from 'src/role/entity/role.entity';
import { Company } from 'src/company/entity/company.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phone?: string;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.MERCHANT,
  })
  userType: UserType;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  userStatus: UserStatus;

  @OneToOne(() => Company, (company) => company.user, { nullable: true })
  @JoinColumn()
  company: Company;

  @Column({ nullable: true })
  companyId: number;

  @ManyToOne(() => Roles, (role) => role.users)
  @JoinColumn()
  role: Roles;

  @Column({ nullable: true })
  roleId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
