import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentSubjectEnrollment } from './student-subject-enrollment.entity';

@Injectable()
export class StudentSubjectEnrollmentService {
  constructor(
    @InjectRepository(StudentSubjectEnrollment)
    private readonly enrollmentRepository: Repository<StudentSubjectEnrollment>,
  ) {}
}
