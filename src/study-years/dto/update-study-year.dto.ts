import { PartialType } from '@nestjs/swagger';
import { CreateStudyYearDto } from './create-study-year.dto';

export class UpdateStudyYearDto extends PartialType(CreateStudyYearDto) {}
