import {
  IsArray,
  IsDate,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateExaminationRequestDto {
  @IsString()
  @MinLength(5)
  symptoms: string;

  @IsString()
  chiefComplaints: string;

  @IsDate()
  appointmentDate: Date;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  appointmentStart: string;

  @IsInt()
  coordinatorId: number;

  @IsArray()
  @IsInt({ each: true })
  teeth: number[];
}
