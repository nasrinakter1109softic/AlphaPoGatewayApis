import { Roles } from 'src/role/entity/role.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  permissionId: number;

  @Column({ unique: true })
  title: string;

  @Column({ unique: true })
  slug: string;

  @ManyToMany(() => Roles, (role) => role.permissions)
  roles: Roles[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
