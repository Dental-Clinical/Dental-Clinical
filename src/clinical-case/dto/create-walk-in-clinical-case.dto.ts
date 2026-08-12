import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { CreatePlannedProcedureWithAnswersDto } from 'src/diagnosis-submission/dto/create-planned-procedure-with-answers.dto';
import { CreatePatientWalkinDto } from 'src/patients/dto/create-walkin-patient.dto';

export class CaseInformationDto {
  @ApiProperty({
    description: 'Subject ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  subjectId: number;

  @ApiProperty({
    description: 'Planned procedures for the clinical case',
    type: () => [CreatePlannedProcedureWithAnswersDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreatePlannedProcedureWithAnswersDto)
  plannedProcedures: CreatePlannedProcedureWithAnswersDto[];
}
class AppointmentDto {
  @ApiProperty({
    description: 'Appointment date',
    example: '2026-08-12',
  })
  @IsNotEmpty()
  @IsDateString()
  appointmentDate: string;

  @ApiProperty({
    description: 'Appointment start time',
    example: '09:00',
  })
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'appointmentStart must be in HH:mm format',
  })
  appointmentStart: string;
}
export class PatientInfoDto {
  @ApiProperty({
    description: 'Patient information for the walk-in clinical case',
    type: () => CreatePatientWalkinDto,
  })
  @ValidateNested()
  @Type(() => CreatePatientWalkinDto)
  patientInfo: CreatePatientWalkinDto;
  @ApiProperty({
    description: 'Symptoms description',
    example: 'Patient complains of toothache and sensitivity.',
  })
  @IsNotEmpty()
  @IsString()
  symptoms: string;
  @ApiProperty({
    description: 'Chief complaint',
    example: 'Patient reports severe pain in the upper left molar.',
  })
  @IsNotEmpty()
  @IsString()
  chiefComplaint: string;
}
export class CreateWalkInClinicalCaseDto {
  @ApiProperty({
    type: () => PatientInfoDto,
  })
  @ValidateNested()
  @Type(() => PatientInfoDto)
  patient: PatientInfoDto;

  @ApiProperty({
    type: () => CaseInformationDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CaseInformationDto)
  caseInfo: CaseInformationDto;

  @ApiProperty({
    type: () => AppointmentDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AppointmentDto)
  appointment: AppointmentDto;
}
