import { ApiProperty } from '@nestjs/swagger';
import { PerformedProceduresDto } from './performed-procedures.dto';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSessionProcedureDto {
  @ApiProperty({
    type: [PerformedProceduresDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PerformedProceduresDto)
  performedProcedures: PerformedProceduresDto[];
}
