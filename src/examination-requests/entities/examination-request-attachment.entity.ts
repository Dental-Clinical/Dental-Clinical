import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ExaminationRequest } from './examination-request.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity()
export class ExaminationRequestAttachments {
  @ApiProperty({ description: 'Attachment ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Request ID', example: 1 })
  @Column()
  request_id: number;

  @ApiProperty({
    type: () => ExaminationRequest,
    description: 'Associated examination request',
  })
  @ManyToOne(
    () => ExaminationRequest,
    (examinationRequest) => examinationRequest.attachments,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'request_id' })
  examination_request: ExaminationRequest;

  @ApiProperty({
    description: 'File URL',
    example: 'https://res.cloudinary.com/.../image.jpg',
  })
  @Column({ name: 'file_url', nullable: true })
  fileUrl: string;

  @ApiProperty({ description: 'Cloudinary public ID', example: 'abc123' })
  @Column({ name: 'public_id', nullable: true })
  publicId: string;

  @ApiProperty({ description: 'File name', example: 'xray-tooth-36.jpg' })
  @Column({ name: 'file_name', nullable: true })
  fileName: string;

  @ApiProperty({ description: 'MIME type', example: 'image/jpeg' })
  @Column({ name: 'mime_type', nullable: true })
  mimeType: string;
}
