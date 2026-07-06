import { Controller, Get, Param } from '@nestjs/common';
import { ClinicalCaseService } from './clinical-case.service';

@Controller('clinical-cases')
export class ClinicalCaseController {
  constructor(private readonly clinicalCaseService: ClinicalCaseService) {}
  @Get()
  async getClinicalCases() {
    return this.clinicalCaseService.findAll();
  }
  @Get(':id')
  async getClinicalCase(@Param('id') id: number) {
    return this.clinicalCaseService.findOne(id);
  }
}
