import { ApiProperty } from '@nestjs/swagger';

export class OpenCasesSummary {
  openCases: OpenCaseDto[];
}

export class OpenCaseDto {
  @ApiProperty({ example: 1 })
  id: number;
  @ApiProperty({ example: 'Ahmad Srour' })
  patient: string;

  @ApiProperty({
    description: 'The subject of the clinical case',
    type: Object,
    example: {
      id: 1,
      name: 'Endodontics',
      requiresDentalChart: true,
    },
  })
  subject: {
    id: number;
    name: string;
    requiresDentalChart: boolean;
  };
  @ApiProperty({ example: 'Dr. John Doe' })
  coordinator: string;
  @ApiProperty({ example: 'Toothache' })
  chiefComplaint: string;
}
