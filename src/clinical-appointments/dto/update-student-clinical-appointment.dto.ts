import { IsEnum, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { ClinicalAppointmentStatus } from "../enums/clinical-appointment.enum";

export class UpdateStudentClinicalAppointmentDto {
  @ApiPropertyOptional({
    enum: ClinicalAppointmentStatus,
    example: ClinicalAppointmentStatus.COMPLETED,
  })
  @IsOptional()
  @IsEnum(ClinicalAppointmentStatus)
  status: ClinicalAppointmentStatus

}
