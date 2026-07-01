import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePatientProfileDto {
  @ApiPropertyOptional({
    description: 'Updated medical history',
    example: 'Asthma, Allergic to penicillin',
  })
  @IsOptional()
  medical_history?: string;

  @ApiPropertyOptional({
    description: 'Updated current medications',
    example: 'Ventolin inhaler',
  })
  @IsOptional()
  current_medications?: string;

  @ApiPropertyOptional({
    description: 'Updated known allergies',
    example: 'Penicillin',
  })
  @IsOptional()
  allergies?: string;
}
