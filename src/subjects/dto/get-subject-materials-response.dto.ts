import { ApiProperty } from '@nestjs/swagger';
import { MaterialItemResponseDto } from './material-item-response.dto';

export class GetSubjectMaterialsResponseDto {
  @ApiProperty({
    description: 'ID of the subject',
    type: Number,
  })
  subjectId: number;

  @ApiProperty({
    description: 'Name of the subject',
    type: String,
  })
  subjectName: string;

  @ApiProperty({
    description: 'Array of materials associated with the subject',
    type: [MaterialItemResponseDto],
  })
  materials: MaterialItemResponseDto[];
}
