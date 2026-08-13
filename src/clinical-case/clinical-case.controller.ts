import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ClinicalCaseService } from './clinical-case.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ClinicalCaseSummaryDto } from './dto/clinical-case-summary.dto';
import {
  AssignedClinicalCaseDetailsDto,
  ClinicalCaseDetailsDto,
} from './dto/clinical-case-details.sto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { FilterClinicalCasesDto } from './dto/get-filtered-clinical-cases.dto';
import { OpenCasesSummary } from './dto/open-clinical-cases-summary.dto';
import { StudentCasesSummaryDto } from './dto/student-cases-summary.dto';
import { StudentAssignedCaseDetailsDto } from './dto/student-assigned-case-details.dto';
import { PatientCaseDetailsDto } from './dto/patient-case-details.dto';
import { PatientCasesSummaryDto } from './dto/patient-cases-summary.dto';
import { SupervisorCaseDetailsDto } from './dto/supervisor-case-details.dto';
import { CreateWalkInClinicalCaseDto } from './dto/create-walk-in-clinical-case.dto';
import { FileUploadInterceptor } from 'src/common/interceptors/files.interceptor';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@ApiTags('Clinical Cases')
@ApiBearerAuth('JWT-auth')
@Controller('clinical-cases')
export class ClinicalCaseController {
  constructor(private readonly clinicalCaseService: ClinicalCaseService) {}
  @Get()
  @ApiOperation({ summary: 'Get all clinical cases, optionally filtered' })
  @ApiOkResponse({
    type: [ClinicalCaseSummaryDto],
    description: 'List of all clinical cases',
  })
  async getClinicalCases(@Query() dto: FilterClinicalCasesDto) {
    return this.clinicalCaseService.findAll(dto);
  }
  @Get('open') // before being assigned
  @ApiOperation({
    summary:
      '[Student] Get open, unassigned clinical cases for the student study year',
  })
  @ApiOkResponse({
    type: OpenCasesSummary,
    description: 'List of open clinical cases retrieved',
  })
  @ApiResponse({
    status: 404,
    description: 'Student or current enrollment not found',
  })
  @Roles([UserRole.STUDENT])
  async getOpenClinicalCases(@CurrentUser() user: AuthenticatedUser) {
    return this.clinicalCaseService.findOpenCases(user.userId);
  }
  @Get('assigned') // after being assigned
  @ApiOperation({
    summary: '[Student] Get assigned clinical cases for the student study year',
  })
  @ApiOkResponse({
    type: OpenCasesSummary,
    description: 'List of assigned clinical cases retrieved',
  })
  @ApiResponse({
    status: 404,
    description: 'Student or current enrollment not found',
  })
  @Roles([UserRole.STUDENT])
  async getAssignedClinicalCases(@CurrentUser() user: AuthenticatedUser) {
    return this.clinicalCaseService.findAssignedCases(user.userId);
  }
  @Get('my-cases') // get all student cases
  @ApiOperation({
    summary: '[Student] Get clinical cases assigned to the current student',
  })
  @ApiOkResponse({
    type: StudentCasesSummaryDto,
    description: 'List of clinical cases retrieved',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @Roles([UserRole.STUDENT])
  async getStudentClinicalCases(@CurrentUser() user: AuthenticatedUser) {
    return this.clinicalCaseService.findStudentCases(user.userId);
  }
  @Get('my/:id/assigned')
  @ApiOperation({ summary: '[Student] Get a clinical case by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Clinical case ID' })
  @ApiOkResponse({
    type: AssignedClinicalCaseDetailsDto,
    description: 'Details of a clinical case',
  })
  @ApiResponse({ status: 404, description: 'Clinical Case not found' })
  async getStudentAssignedClinicalCase(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.clinicalCaseService.findStudentAssignedClinicalCase(
      id,
      user.userId,
    );
  }
  @Get('open/:id')
  @ApiOperation({ summary: '[Student] Get a clinical case by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Clinical case ID' })
  @ApiOkResponse({
    type: ClinicalCaseDetailsDto,
    description: 'Details of a clinical case',
  })
  @ApiResponse({ status: 404, description: 'Clinical Case not found' })
  async getClinicalCase(@Param('id', ParseIntPipe) id: number) {
    return this.clinicalCaseService.findOpenClinicalCaseDetails(id);
  }
  @Get('my/:id')
  @ApiOperation({
    summary: '[Student] Get a clinical case by ID for the current student',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Clinical case ID' })
  @ApiOkResponse({
    type: StudentAssignedCaseDetailsDto,
    description: 'Details of a clinical case',
  })
  @ApiResponse({
    status: 403,
    description: 'Clinical Case is assigned to another student',
  })
  @ApiResponse({ status: 404, description: 'Clinical Case not found' })
  @Roles([UserRole.STUDENT])
  async getStudentClinicalCase(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.clinicalCaseService.findStudentCaseDetails(
      id,
      user.userId,
    );
  }
  @Get('patient')
  @ApiOperation({
    summary: '[Patient] Get all clinical cases of the current patient',
  })
  @ApiOkResponse({
    type: PatientCasesSummaryDto,
    description: 'List of the clinical cases belonging to the patient',
  })
  @Roles([UserRole.PATIENT])
  async getPatientClinicalCases(@CurrentUser() user: AuthenticatedUser) {
    return await this.clinicalCaseService.findPatientCases(user.userId);
  }
  @Get('patient/:id')
  @ApiOperation({
    summary: "[Patient] Get one of the current patient's clinical cases by ID",
  })
  @ApiParam({ name: 'id', type: Number, description: 'Clinical case ID' })
  @ApiOkResponse({
    type: PatientCaseDetailsDto,
    description: 'Details of a clinical case',
  })
  @ApiResponse({
    status: 403,
    description: 'Clinical Case belongs to another patient',
  })
  @ApiResponse({ status: 404, description: 'Clinical Case not found' })
  @Roles([UserRole.PATIENT])
  async getPatientClinicalCase(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.clinicalCaseService.findPatientCaseDetails(
      id,
      user.userId,
    );
  }

  @Post('walk-in')
  @Roles([UserRole.STUDENT])
  @UseInterceptors(
    FileUploadInterceptor({
      fieldName: 'images',
      maxCount: 10,
    }),
  )
  async createWalkInClinicalCase(
    @Body('data') data: string,
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    let dto: CreateWalkInClinicalCaseDto;

    if (!data) {
      throw new BadRequestException('The data field is required.');
    }

    let parsedData: unknown;

    try {
      parsedData = JSON.parse(data);
    } catch {
      throw new BadRequestException('The data field must contain valid JSON.');
    }

    dto = plainToInstance(CreateWalkInClinicalCaseDto, parsedData);

    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const messages = this.extractValidationMessages(errors);

      throw new BadRequestException(messages);
    }
    return await this.clinicalCaseService.createWalkInClinicalCase(
      user.userId,
      dto,
      files,
    );
  }
  private extractValidationMessages(errors: any[]): string[] {
    const messages: any[] = [];

    function traverse(error: any) {
      // Check if current node has constraints
      if (error.constraints) {
        messages.push(...Object.values(error.constraints));
      }

      // Recursively traverse children
      if (error.children && Array.isArray(error.children)) {
        for (const child of error.children) {
          traverse(child);
        }
      }
    }

    for (const error of errors) {
      traverse(error);
    }

    return messages;
  }
}
