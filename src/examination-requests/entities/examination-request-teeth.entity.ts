import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ExaminationRequest } from './examination-request.entity';

@Entity()
@Unique(['request_id', 'tooth'])
export class ExaminationRequestTeeth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  request_id: number;

  @ManyToOne(() => ExaminationRequest, (request) => request.teeth, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'request_id' })
  examination_request: ExaminationRequest;

  @Column()
  tooth: number;
}
