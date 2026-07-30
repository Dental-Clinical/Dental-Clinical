import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ReviewTreatmentSessionDto {
  @ApiProperty({
    description: 'Supervisor notes for the treatment session',
    example:
      'The student performed the procedures well and followed the guidelines.',
  })
  @IsString()
  supervisorNotes: string;
}
