import { ApiProperty } from '@nestjs/swagger';

export class MaterialItemResponseDto {
  @ApiProperty({
    description: 'ID of the material',
    type: Number,
  })
  materialId: number;

  @ApiProperty({
    description: 'Name of the material',
    type: String,
  })
  materialName: string;
}
