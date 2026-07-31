import { ApiProperty } from '@nestjs/swagger';

export class OpenCasesSummary {
  openCases: OpenCaseDto[];
}

export class OpenCaseDto {
  @ApiProperty({ example: 1 })
  id: number;
  @ApiProperty({ example: 'Ahmad Srour' })
  patient: string;
  @ApiProperty({ example: 'Operative Dentistry' })
  subject: string;
  @ApiProperty({ example: 'Dr. John Doe' })
  supervisor: string;
  @ApiProperty({ example: 'Toothache' })
  chiefComplaint: string;
}
