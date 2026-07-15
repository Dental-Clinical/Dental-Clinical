import { Controller, Get, Param } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { AllowAnonymous } from 'src/auth/decorators/allow-anonymous.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';

@ApiTags('Subjects')
@ApiBearerAuth('JWT-auth')
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}
  @Get('/:id/procedures')
  @AllowAnonymous()
  @ApiOperation({ summary: 'Get procedures for a subject' })
  @ApiParam({ name: 'id', description: 'Subject ID', type: Number })
  @ApiOkResponse({
    description: 'Subject procedures retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        subjectId: { type: 'number', example: 1 },
        subjectName: { type: 'string', example: 'Restorative Dentistry' },
        procedures: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              procedureId: { type: 'number', example: 1 },
              procedureName: { type: 'string', example: 'Composite Filling' },
              description: { type: 'string', example: 'Direct composite restoration' },
            },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Subject not found' })
  async getSubjectProcedures(@Param('id') id: number) {
    return await this.subjectsService.getSubjectProcedures(id);
  }
}
