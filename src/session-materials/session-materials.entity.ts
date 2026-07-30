import { Material } from 'src/materials/materials.entity';
import { TreatmentSession } from 'src/treatment-sessions/treatment-sessions.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('session_materials')
export class SessionMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => TreatmentSession,
    (treatmentSession) => treatmentSession.sessionMaterials,
  )
  @JoinColumn({ name: 'treatment_session_id' })
  treatmentSession: TreatmentSession;

  @ManyToOne(() => Material, (material) => material.sessionMaterials)
  @JoinColumn({ name: 'material_id' })
  material: Material;
}
