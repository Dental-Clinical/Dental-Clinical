import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { SessionMaterialDto } from './session-material.dto';
import {
  ApiProperty,
  ApiPropertyOptional,
} from 'node_modules/@nestjs/swagger/dist/decorators/api-property.decorator';
import { Type } from 'class-transformer';
import { PerformedProceduresDto } from './performed-procedures.dto';

export class CompleteTreatmentSessionDto {
  @ApiPropertyOptional({
    example: 'Patient tolerated treatment well.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  studentNotes?: string;

  @ApiPropertyOptional({
    type: [SessionMaterialDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SessionMaterialDto)
  materials?: SessionMaterialDto[];

  @ApiProperty({
    type: [PerformedProceduresDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PerformedProceduresDto)
  performedProcedures: PerformedProceduresDto[];
}
