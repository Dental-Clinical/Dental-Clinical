import { SessionMaterial } from 'src/session-materials/session-materials.entity';
import { Subject } from 'src/subjects/subjects.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @ManyToMany(() => Subject, (subject) => subject.materials)
  subjects: Subject[];

  @OneToMany(
    () => SessionMaterial,
    (sessionMaterial) => sessionMaterial.material,
  )
  sessionMaterials: SessionMaterial[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
