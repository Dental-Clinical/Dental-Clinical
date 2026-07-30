import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ApproveReviewDto {
  @ApiPropertyOptional({
    description: 'Optional notes for the review',
    example: 'Approved with minor corrections needed.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
