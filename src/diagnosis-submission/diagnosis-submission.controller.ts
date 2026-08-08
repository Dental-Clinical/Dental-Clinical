import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
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
import {
  GetDiagnosisSubmissionResponseDto,
  SubmitDiagnosisResponseDto,
} from './dto/diagnosis-submission-response.dto';

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
      fieldName: 'images',
      maxCount: 10,
    }),
  )
  @ApiOperation({ summary: '[Student] Submit a diagnosis for a clinical case' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['clinicalCaseId', 'answers', 'plannedProcedures'],
      properties: {
        clinicalCaseId: {
          type: 'number',
          example: 1,
          description: 'Clinical case ID',
        },
        answers: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            required: ['questionId', 'answer'],
            properties: {
              questionId: {
                type: 'number',
                example: 1,
                description: 'Subject diagnosis question ID',
              },
              answer: {
                type: 'string',
                example: 'Yes',
                description:
                  'Answer text (comma-separated option values for multiple-choice questions)',
              },
            },
          },
          description:
            'Answers to the subject diagnosis questions (multipart fields: answers[0][questionId], answers[0][answer], ...)',
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
    type: SubmitDiagnosisResponseDto,
    description: 'Diagnosis submitted successfully',
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
    @UploadedFiles() files: Express.Multer.File[],
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
  @ApiOkResponse({
    type: GetDiagnosisSubmissionResponseDto,
    description: 'Diagnosis submission retrieved successfully',
  })
  @ApiNotFoundResponse({ description: 'Diagnosis submission not found' })
  async getDiagnosisSubmission(@Param('id') id: number) {
    return await this.diagnosisSubmissionService.getDiagnosisSubmission(id);
  }
}
