import { IsArray, IsDateString, IsInt, IsOptional, IsString, MinLength } from "class-validator";

export class CreateExaminationRequestDto {
  @IsString()
  @MinLength(5)
  symptoms: string

  @IsDateString()
  appointment: string

  @IsArray()
  @IsInt({ each: true })
  teeth: number[]

}
