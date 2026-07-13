import { Controller, Get, Param } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { AllowAnonymous } from 'src/auth/decorators/allow-anonymous.decorator';

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}
  @Get('/:id/procedures')
  @AllowAnonymous()
  async getSubjectProcedures(@Param('id') id: number) {
    return await this.subjectsService.getSubjectProcedures(id);
  }
}
