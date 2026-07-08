import { Controller, Get, Param } from '@nestjs/common';
import { ClinicalCaseService } from './clinical-case.service';
import { AllowAnonymous } from 'src/auth/decorators/allow-anonymous.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import { ApiAcceptedResponse, ApiOkResponse } from '@nestjs/swagger';
import { ClinicalCaseSummaryDto } from './dto/clinical-case-summary.dto';
import { ClinicalCaseDetailsDto } from './dto/clinical-case-details.sto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@Controller('clinical-cases')
export class ClinicalCaseController {
  constructor(private readonly clinicalCaseService: ClinicalCaseService) {}
  @Get()
  @ApiOkResponse({
    type: [ClinicalCaseSummaryDto],
    description: 'List of all clinical cases',
  })
  async getClinicalCases() {
    return this.clinicalCaseService.findAll();
  }
  @Get(':id')
  @ApiOkResponse({
    type: ClinicalCaseDetailsDto,
    description: 'Details of a clinical case',
  })
  async getClinicalCase(@Param('id') id: number) {
    return this.clinicalCaseService.findOne(id);
  }
  @Get('open')
  @ApiOkResponse({
    type: [ClinicalCaseSummaryDto],
    description: 'List of all open clinical cases',
  })
  @Roles([UserRole.STUDENT])
  async getOpenClinicalCases(@CurrentUser() user: AuthenticatedUser) {
    return this.clinicalCaseService.findOpenCases(user.userId);
  }
}
