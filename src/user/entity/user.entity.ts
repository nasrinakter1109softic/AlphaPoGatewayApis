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
import { Otp } from 'src/otp/entity/otp.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ unique: true })
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

  @OneToOne(() => Otp, (otp) => otp.user, { nullable: true })
  @JoinColumn()
  otp: Otp;

  @Column({ nullable: true })
  otpId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
