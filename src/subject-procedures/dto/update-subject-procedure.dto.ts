import { PartialType } from '@nestjs/swagger';
import { CreateSubjectProcedureDto } from './create-subject-procedure.dto';

export class UpdateSubjectProcedureDto extends PartialType(
  CreateSubjectProcedureDto,
) {}
