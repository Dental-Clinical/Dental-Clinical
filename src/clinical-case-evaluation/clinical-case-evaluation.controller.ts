import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { UserRole } from 'src/constants/user-roles';
import { ClinicalCaseEvaluationService } from './clinical-case-evaluation.service';
import { CreateClinicalCaseEvaluationDto } from './dto/create-clinical-case-evaluation.dto';
import {
  CreateClinicalCaseEvaluationResponseDto,
  GetClinicalCaseEvaluationsResponseDto,
} from './dto/clinical-case-evaluation-response.dto';
import { UpdateClinicalCaseEvaluationDto } from './dto/update-clinical-case-evaluation.dto';
import { GetClinicalCaseEvaluationsQueryDto } from './dto/get-clinical-case-evaluations-query.dto';

@ApiTags('Clinical Case Evaluations')
@ApiBearerAuth('JWT-auth')
@Controller('clinical-cases')
export class ClinicalCaseEvaluationController {
  constructor(
    private readonly clinicalCaseEvaluationService: ClinicalCaseEvaluationService,
  ) { }

  @Post(':id/evaluation')
  @Roles([UserRole.SUPERVISOR])
  @ApiOperation({
    summary: '[Supervisor] Submit the final evaluation for a clinical case',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Clinical case ID' })
  @ApiBody({ type: CreateClinicalCaseEvaluationDto })
  @ApiCreatedResponse({
    type: CreateClinicalCaseEvaluationResponseDto,
    description: 'Clinical case evaluated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Supervisor does not supervise this clinical case',
  })
  @ApiResponse({
    status: 404,
    description: 'Supervisor, clinical case or assigned student not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Case is not awaiting review or already has an evaluation',
  })
  public async createClinicalCaseEvaluation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) clinicalCaseId: number,
    @Body() dto: CreateClinicalCaseEvaluationDto,
  ) {
    return await this.clinicalCaseEvaluationService.createClinicalCaseEvaluation(
      user,
      clinicalCaseId,
      dto,
    );
  }

  @Patch('evaluations/:id')
  @Roles([UserRole.SUPERVISOR])
  @ApiOperation({
    summary: '[Supervisor] Update an existing clinical case evaluation',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Evaluation ID' })
  @ApiBody({ type: UpdateClinicalCaseEvaluationDto })
  @ApiOkResponse({
    description: 'Clinical case evaluation updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'No fields to update',
  })
  @ApiResponse({
    status: 403,
    description: 'Supervisor does not supervise this clinical case',
  })
  @ApiResponse({ status: 404, description: 'Evaluation not found' })
  public async updateClinicalCaseEvaluation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClinicalCaseEvaluationDto
  ) {
    return await this.clinicalCaseEvaluationService.updateClinicalCaseEvaluation(id, user, dto)
  }

  @Get('evaluations')
  @Roles([UserRole.STUDENT])
  @ApiOperation({
    summary: "[Student] Get all of the current student's clinical case evaluations",
  })
  @ApiOkResponse({
    type: GetClinicalCaseEvaluationsResponseDto,
    description: 'Clinical case evaluations retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid date range' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  public async getAllClinicalCasesEvaluations(
    @CurrentUser() user: AuthenticatedUser,
    @Query() dto: GetClinicalCaseEvaluationsQueryDto,
  ) {
    return await this.clinicalCaseEvaluationService.getAllClinicalCasesEvaluations(user, dto)
  }

  @Get('evaluations/:id')
  @Roles([UserRole.SUPERVISOR, UserRole.STUDENT])
  @ApiOperation({
    summary: '[Supervisor | Student] Get a clinical case evaluation',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Evaluation ID' })
  @ApiOkResponse({
    description: 'Clinical case evaluation retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'User is not the student or supervisor of this evaluation',
  })
  @ApiResponse({ status: 404, description: 'Evaluation not found' })
  public async getClinicalCaseEvaluation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.clinicalCaseEvaluationService.getClinicalCaseEvaluation(id, user)
  }
}
