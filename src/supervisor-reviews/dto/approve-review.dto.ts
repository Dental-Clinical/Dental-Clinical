import { IsOptional, IsString } from 'class-validator';

export class ApproveReviewDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
