import { IsOptional, IsString } from 'class-validator';

export class CaseMediaMetadataDto {
  @IsOptional()
  @IsString()
  description?: string;
}
