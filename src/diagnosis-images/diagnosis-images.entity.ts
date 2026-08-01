import { DiagnosisSubmission } from 'src/diagnosis-submission/diagnosis-submission.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('diagnosis_images')
export class DiagnosisImages {
  @ApiProperty({ description: 'Image ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: () => DiagnosisSubmission,
    description: 'Associated diagnosis submission',
  })
  @ManyToOne(
    () => DiagnosisSubmission,
    (diagnosisSubmission) => diagnosisSubmission.images,
  )
  @JoinColumn({ name: 'diagnosis_submission_id' })
  diagnosisSubmission: DiagnosisSubmission;

  @ApiProperty({ description: 'Cloudinary public ID', example: 'abc123' })
  @Column({ name: 'public_id' })
  publicId: string;

  @ApiProperty({
    description: 'Cloudinary file URL',
    example: 'https://res.cloudinary.com/.../image.jpg',
  })
  @Column({ name: 'file_url' })
  fileUrl: string;

  @ApiProperty({ description: 'File name', example: 'xray-tooth-36.jpg' })
  @Column({ name: 'file_name' })
  fileName: string;

  @ApiProperty({ description: 'MIME type', example: 'image/jpeg' })
  @Column({ name: 'mime_type' })
  mimeType: string;

  @ApiProperty({ description: 'Upload timestamp' })
  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
