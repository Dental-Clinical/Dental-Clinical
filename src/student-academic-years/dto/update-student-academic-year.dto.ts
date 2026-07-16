import { PartialType } from '@nestjs/swagger';
import { CreateStudentAcademicYearDto } from './create-student-academic-year.dto';

export class UpdateStudentAcademicYearDto extends PartialType(
  CreateStudentAcademicYearDto,
) {}
