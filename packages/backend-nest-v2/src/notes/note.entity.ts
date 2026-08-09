import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ nullable: true })
  summary!: string;

  @Column()
  content!: string;

  @Column({ nullable: true })
  category!: string;

  // 先設 nullable：等 JwtAuthGuard 接上、create() 能拿到目前使用者後再改成必填
  @Column({ name: 'owner_id', type: 'int', nullable: true })
  ownerId!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
