import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Menu } from 'src/menu/entity/menu.entity';
import { Permission } from 'src/permission/entity/permission.entity';
import { User } from 'src/user/entity/user.entity';

@Entity('roles')
export class Roles {
  @PrimaryGeneratedColumn({ name: 'roleId' })
  roleId: number;

  @Column({ default: false, name: 'isPredefined' })
  isPredefined: boolean;

  @Column({ length: 100, unique: true, name: 'roleName' })
  roleName: string;

  @CreateDateColumn({ type: 'timestamptz', precision: 6, name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', precision: 6, name: 'updatedAt' })
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable()
  permissions: Permission[];

  @ManyToMany(() => Menu, (menu) => menu.roles)
  @JoinTable()
  menus: Menu[];
}
