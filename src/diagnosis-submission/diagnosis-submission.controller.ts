import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { DiagnosisSubmissionService } from './diagnosis-submission.service';
import { CreateDiagnosisSubmissionDto } from './dto/create-diagnosis-submission.dto';
import { FileUploadInterceptor } from 'src/common/interceptors/files.interceptor';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';

@Controller('diagnosis-submission')
export class DiagnosisSubmissionController {
  constructor(
    private readonly diagnosisSubmissionService: DiagnosisSubmissionService,
  ) {}
  @Post()
  @Roles([UserRole.STUDENT])
  @UseInterceptors(
    FileUploadInterceptor({
      uploadPath: './uploads/diagnosis-submissions',
      fieldName: 'images',
      maxCount: 10,
    }),
  )
  async submitDiagnosis(
    @Body() dto: CreateDiagnosisSubmissionDto,
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() files: Express.Multer.File[],
  ) {
    return await this.diagnosisSubmissionService.submitDiagnosis(
      dto,
      user,
      files,
    );
  }
  @Get(':id')
  async getDiagnosisSubmission(@Param('id') id: number) {
    return await this.diagnosisSubmissionService.getDiagnosisSubmission(id);
  }
}
