import { PartialType } from '@nestjs/swagger';
import { CreateClinicSectionDto } from './create-clinic-section.dto';

export class UpdateClinicSectionDto extends PartialType(
  CreateClinicSectionDto,
) {}
