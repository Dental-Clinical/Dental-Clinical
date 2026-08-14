import { ApiProperty } from '@nestjs/swagger';

export class DentalAiFindingResponseDto {
  @ApiProperty({
    example: 'Caries',
    description: 'The dental condition detected by the AI model.',
  })
  condition: string;

  @ApiProperty({
    example: 0.84,
    description: 'Confidence score returned by the AI model.',
    minimum: 0,
    maximum: 1,
  })
  confidence: number;

  @ApiProperty({
    example: 'lower left molar',
    description: 'Estimated anatomical region of the finding.',
  })
  region: string;

  @ApiProperty({
    example: 'red',
    description: 'Color used to highlight this finding in the generated image.',
  })
  color: string;
}
