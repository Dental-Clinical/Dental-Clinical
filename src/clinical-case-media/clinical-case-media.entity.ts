import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';
import { Student } from 'src/students/student.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'clinical_case_media' })
export class ClinicalCaseMedia {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ClinicalCase, (clinicalCase) => clinicalCase.media, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'clinical_case_id' })
  clinicalCase: ClinicalCase;

  @ManyToOne(() => Student, {
    nullable: false,
  })
  @JoinColumn({ name: 'uploaded_by_student_id' })
  uploadedBy: Student;

  @Column({ name: 'public_id' })
  publicId: string;
  @Column({ name: 'file_url' })
  fileUrl: string;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;
}
