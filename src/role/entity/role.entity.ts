import {
  Column,
  CreateDateColumn,
  Entity,
  // OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
// import { Users } from './users.entity';
// import { Permission } from './permission.entity';
// import { Menu } from './menu.entity';

@Entity('roles')
export class Roles {
  @PrimaryGeneratedColumn()
  roleId: number;

  @Column({ default: false })
  isPredefined: boolean;

  @Column({ default: false })
  isUsed: boolean;

  @Column({ length: 100, unique: true })
  roleName: string;

  @CreateDateColumn({ type: 'timestamptz', precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', precision: 6 })
  updatedAt: Date;

  // @OneToMany(() => Users, (user) => user.role)
  // users: Users[];

  // @OneToMany(() => Permission, (permission) => permission.role)
  // permissions: Permission[];

  // @OneToMany(() => Menu, (menu) => menu.role)
  // Menus: Menu[];
}
