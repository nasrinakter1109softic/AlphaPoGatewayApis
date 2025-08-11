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
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'roleId' },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'permissionId',
    },
  })
  permissions: Permission[];

  @ManyToMany(() => Menu, (menu) => menu.roles)
  @JoinTable({
    name: 'role_menus',
    joinColumn: { name: 'role_id', referencedColumnName: 'roleId' },
    inverseJoinColumn: { name: 'menu_id', referencedColumnName: 'id' },
  })
  menus: Menu[];
}
