import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
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
import { CreateClinicalCaseEvaluationResponseDto } from './dto/clinical-case-evaluation-response.dto';

@ApiTags('Clinical Case Evaluations')
@ApiBearerAuth('JWT-auth')
@Controller('clinical-cases')
export class ClinicalCaseEvaluationController {
  constructor(
    private readonly clinicalCaseEvaluationService: ClinicalCaseEvaluationService,
  ) {}

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
}
