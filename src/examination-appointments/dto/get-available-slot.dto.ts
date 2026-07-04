import { IsDateString } from 'class-validator';

export class GetAvailableSlotDto {
  @IsDateString()
  date: string;
}
