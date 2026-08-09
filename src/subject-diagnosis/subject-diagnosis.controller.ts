import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SubjectDiagnosisService } from './subject-diagnosis.service';
import { CreateSubjectDiagnosisQuestionDto } from './dto/creaet-subject-diagnosis-question.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';

@Controller('subjects')
export class SubjectDiagnosisController {
  constructor(
    private readonly subjectDiagnosisService: SubjectDiagnosisService,
  ) { }
  @Post(':id/diagnosis-questions')
  @Roles([UserRole.ADMIN])
  async createDiagnosisQuestions(
    @Body() dto: CreateSubjectDiagnosisQuestionDto,
    @Param('id') subjectId: number,
  ) {
    return await this.subjectDiagnosisService.createDiagnosisQuestions(
      dto,
      subjectId,
    );
  }
  @Get(':id/diagnosis-questions')
  async getDiagnosisQuestions(@Param('id') subjectId: number) {
    return await this.subjectDiagnosisService.getDiagnosisQuestionsBySubjectId(
      subjectId,
    );
  }
}
