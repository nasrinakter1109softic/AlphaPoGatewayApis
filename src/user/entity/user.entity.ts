import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UserType } from 'src/common/enums/user-type.enum';
import { UserStatus } from 'src/common/enums/user-status';
import { Roles } from 'src/role/entity/role.entity';
import { Company } from 'src/company/entity/company.entity';
import { RefreshToken } from 'src/auth/refreshToken/refresh-token.entity';
import { Otp } from 'src/otp/entity/otp.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ unique: true, nullable: true })
  phone?: string | null;

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
  @JoinColumn({ name: 'companyId', referencedColumnName: 'companyId' })
  company: Company;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @Column({ nullable: true })
  companyId: number;

  @ManyToOne(() => Roles, (role) => role.users)
  @JoinColumn()
  role: Roles;

  @Column({ nullable: true })
  roleId: number;

  @OneToMany(() => Otp, (otp) => otp.user)
  otps: Otp[];

  @Column({ nullable: true })
  otpId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
