import { PartialType } from '@nestjs/swagger';
import { CreateStudentSectionDto } from './create-student-section.dto';

export class UpdateStudentSectionDto extends PartialType(
  CreateStudentSectionDto,
) {}
