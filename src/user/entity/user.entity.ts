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

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.COMPANY,
  })
  user_type: UserType;

  @Column({ default: true })
  is_active: boolean;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  user_status: UserStatus;

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
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
