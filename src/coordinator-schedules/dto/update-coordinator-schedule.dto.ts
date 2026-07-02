import { PartialType } from '@nestjs/swagger';
import { CreateCoordinatorScheduleDto } from './create-coordinator-schedule.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCoordinatorScheduleDto extends PartialType(
  CreateCoordinatorScheduleDto,
) {
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
