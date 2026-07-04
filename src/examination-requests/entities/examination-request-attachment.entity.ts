import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ExaminationRequest } from './examination-request.entity';
@Entity()
export class ExaminationRequestAttachments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  request_id: number;

  @ManyToOne(
    () => ExaminationRequest,
    (examinationRequest) => examinationRequest.attachments,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'request_id' })
  examination_request: ExaminationRequest;

  @Column()
  file_path: string;

  @Column()
  file_name: string;

  @Column()
  mime_type: string;
}
