import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ExaminationRequest } from './examination-request.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Unique(['request_id', 'tooth'])
export class ExaminationRequestTeeth {
  @ApiProperty({ description: 'Record ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Request ID', example: 1 })
  @Column()
  request_id: number;

  @ApiProperty({
    type: () => ExaminationRequest,
    description: 'Associated examination request',
  })
  @ManyToOne(() => ExaminationRequest, (request) => request.teeth, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'request_id' })
  examination_request: ExaminationRequest;

  @ApiProperty({ description: 'Tooth number', example: 36 })
  @Column()
  tooth: number;
}
