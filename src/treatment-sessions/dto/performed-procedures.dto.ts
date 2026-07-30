import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PlannedProceduresStatus } from 'src/planned-procedures/enum/planned-procedures-status.enum';

export class PerformedProceduresDto {
  @ApiPropertyOptional({
    description: 'ID of the planned procedure',
    example: 1,
  })
  @IsNumber()
  plannedProcedureId: number;

  @ApiPropertyOptional({
    description: 'Status of the performed procedure',
    example: PlannedProceduresStatus.PLANNED,
  })
  @IsOptional()
  @IsEnum(PlannedProceduresStatus)
  status: PlannedProceduresStatus;
}
