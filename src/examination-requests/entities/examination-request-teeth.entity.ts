import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { ExaminationRequest } from './examination-request.entity';

@Entity()
export class ExaminationRequestTeeth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  request_id: number;

  @ManyToOne(() => ExaminationRequest)
  @JoinColumn({ name: 'request_id' })
  examination_request: ExaminationRequest;

  @Column()
  tooth: number;
}
