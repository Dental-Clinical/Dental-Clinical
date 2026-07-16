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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

@ApiTags('Diagnosis Submission')
@ApiBearerAuth('JWT-auth')
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
  @ApiOperation({ summary: 'Submit a diagnosis for a clinical case' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['clinicalCaseId', 'clinicalImpression', 'plannedProcedures'],
      properties: {
        clinicalCaseId: {
          type: 'number',
          example: 1,
          description: 'Clinical case ID',
        },
        clinicalImpression: {
          type: 'string',
          example: 'Deep caries on tooth 36',
          description: 'Clinical impression text',
        },
        plannedProcedures: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            required: ['subjectProcedureId', 'toothNumber'],
            properties: {
              subjectProcedureId: {
                type: 'number',
                example: 1,
                description: 'Subject procedure ID',
              },
              toothNumber: {
                type: 'number',
                example: 36,
                description: 'Tooth number',
              },
            },
          },
          description: 'List of planned procedures',
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Diagnosis images (max 10)',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Diagnosis submitted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Diagnosis submitted successfully for supervisor review.',
        },
        data: {
          type: 'object',
          properties: {
            diagnosisSubmissionId: { type: 'number', example: 1 },
            clinicalCaseId: { type: 'number', example: 1 },
            status: { type: 'string', example: 'diagnosis_pending_review' },
            plannedProcedures: { type: 'number', example: 2 },
            uploadedImages: { type: 'number', example: 3 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Student or clinical case not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Clinical case is not ready for diagnosis submission',
  })
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
  @ApiOperation({ summary: 'Get a diagnosis submission by ID' })
  @ApiParam({
    name: 'id',
    description: 'Diagnosis submission ID',
    type: Number,
  })
  @ApiOkResponse({ description: 'Diagnosis submission retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Diagnosis submission not found' })
  async getDiagnosisSubmission(@Param('id') id: number) {
    return await this.diagnosisSubmissionService.getDiagnosisSubmission(id);
  }
}
