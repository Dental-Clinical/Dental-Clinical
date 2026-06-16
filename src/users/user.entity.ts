import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    type: 'varchar',
    nullable: true,
  })
  first_name: string;
  @Column({
    type: 'varchar',
    nullable: true,
  })
  last_name: string;
  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  phone: string;
  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  email: string;
  @Column({
    type: 'varchar',
    nullable: true,
  })
  password_hash: string;
  @Column({
    type: 'enum',
    enum: ['admin', 'patient', 'supervisor', 'student', 'coordinator'],
  })
  role: string;
  @Column({
    type: 'varchar',
    nullable: true,
  })
  profile_image: string;
  @Column({
    type: 'boolean',
    default: true,
  })
  is_active: boolean;
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
}
