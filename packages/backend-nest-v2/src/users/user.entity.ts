import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Permission } from '../auth/permission.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  // 明碼儲存,沒有做 hash —— 「沒有資安」版本,正式環境一定要用方式做雜湊
  @Column()
  password!: string;

  @Column({ default: 'active' })
  status!: string;

  // Postgres 原生 enum 陣列：DB 層就會擋掉不合法的權限字串，不用只靠應用層檢查
  @Column({ type: 'enum', enum: Permission, array: true, default: [] })
  permissions!: Permission[];

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
