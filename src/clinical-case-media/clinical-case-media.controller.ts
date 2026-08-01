import {
  Body,
  Controller,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { FileUploadInterceptor } from 'src/common/interceptors/files.interceptor';
import { ClinicalCaseMediaService } from './clinical-case-media.service';

@Controller('clinical-cases')
export class ClinicalCaseMediaController {
  constructor(
    private readonly clinicalCaseMediaService: ClinicalCaseMediaService,
  ) {}
  @Post(':id/media')
  @UseInterceptors(FileUploadInterceptor({ fieldName: 'media', maxCount: 10 }))
  async uploadMedia(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') clinicalCaseId: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('metadata') metadata: string,
  ) {
    return await this.clinicalCaseMediaService.uploadMedia(
      clinicalCaseId,
      user.userId,
      files,
      JSON.parse(metadata || '{}'),
    );
  }
}
