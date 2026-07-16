import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
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
import { ClinicalCaseDetailsDto } from './dto/clinical-case-details.sto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { FilterClinicalCasesDto } from './dto/get-filtered-clinical-cases.dto';

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
  @Get('open')
  @ApiOperation({
    summary: 'Get open, unassigned clinical cases for the student study year',
  })
  @ApiOkResponse({ description: 'List of open clinical cases retrieved' })
  @ApiResponse({
    status: 404,
    description: 'Student or current enrollment not found',
  })
  @Roles([UserRole.STUDENT])
  async getOpenClinicalCases(@CurrentUser() user: AuthenticatedUser) {
    return this.clinicalCaseService.findOpenCases(user.userId);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get a clinical case by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Clinical case ID' })
  @ApiOkResponse({
    type: ClinicalCaseDetailsDto,
    description: 'Details of a clinical case',
  })
  @ApiResponse({ status: 404, description: 'Clinical Case not found' })
  async getClinicalCase(@Param('id', ParseIntPipe) id: number) {
    return this.clinicalCaseService.findOne(id);
  }
  @Get('my-cases')
  @ApiOperation({
    summary: 'Get clinical cases assigned to the current student',
  })
  @ApiOkResponse({ description: 'List of clinical cases retrieved' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @Roles([UserRole.STUDENT])
  async getStudentClinicalCases(@CurrentUser() user: AuthenticatedUser) {
    return this.clinicalCaseService.findStudentCases(user.userId);
  }
}
