import { ClinicalCase } from '../clinical-case/clinical-case.entity';
import { ExaminationRequest } from '../examination-requests/entities/examination-request.entity';
import { User } from '../users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('patients')
export class Patient {
  @ApiProperty({ description: 'Patient ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({
    type: () => User,
    description: 'Associated user account',
  })
  @OneToOne(() => User, (user) => user.patient, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user?: User;

  @ApiProperty({ description: 'Patient full name', example: 'Sara Ali' })
  @Column()
  full_name: string;

  @ApiProperty({ description: 'Phone number', example: '+963912345678' })
  @Column()
  phone: string;

  @ApiProperty({ description: 'Walk-in patient flag', example: false })
  @Column({
    default: false,
  })
  is_walkin: boolean;

  @ApiPropertyOptional({
    description: 'Medical history',
    example: 'No chronic conditions',
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  medical_history: string;

  @ApiPropertyOptional({ description: 'Allergies', example: 'Penicillin' })
  @Column({
    type: 'text',
    nullable: true,
  })
  allergies: string;

  @ApiPropertyOptional({ description: 'Current medications', example: 'None' })
  @Column({
    type: 'text',
    nullable: true,
  })
  current_medications: string;

  @ApiProperty({ description: 'Record creation timestamp' })
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @ApiPropertyOptional({
    type: () => [ExaminationRequest],
    description: 'Examination requests',
  })
  @OneToMany(() => ExaminationRequest, (request) => request.patient)
  examination_requests: ExaminationRequest[];

  @ApiPropertyOptional({
    type: () => [ClinicalCase],
    description: 'Clinical cases',
  })
  @OneToMany(() => ClinicalCase, (clinicalCase) => clinicalCase.patient)
  clinical_cases: ClinicalCase[];
}
