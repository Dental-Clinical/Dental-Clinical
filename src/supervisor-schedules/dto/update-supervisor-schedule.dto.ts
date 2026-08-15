import { PartialType } from '@nestjs/swagger';
import { CreateSupervisorScheduleDto } from './create-supervisor-schedule.dto';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class UpdateSupervisorScheduleDto extends PartialType(
  CreateSupervisorScheduleDto,
) {
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
