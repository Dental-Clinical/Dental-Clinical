import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { AllowAnonymous } from 'src/auth/decorators/allow-anonymous.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { GetSubjectsQueryDto } from './dto/get-subjects-query.dto';
import {
  CreateSubjectResponseDto,
  DeleteSubjectResponseDto,
  GetSubjectsResponseDto,
  SubjectItemResponseDto,
  UpdateSubjectResponseDto,
} from './dto/subject-response.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { GetSubjectMaterialsResponseDto } from './dto/get-subject-materials-response.dto';
import { CreateSubjectMaterialsDto } from './dto/create-subject-materials.dto';

@ApiTags('Subjects')
@ApiBearerAuth('JWT-auth')
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Create a subject' })
  @ApiBody({ type: CreateSubjectDto })
  @ApiCreatedResponse({
    type: CreateSubjectResponseDto,
    description: 'Subject created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Study year not found' })
  @ApiResponse({
    status: 409,
    description: 'Subject name already exists for this study year',
  })
  async createSubject(@Body() dto: CreateSubjectDto) {
    return await this.subjectsService.createSubject(dto);
  }

  @Get()
  @Roles([UserRole.ADMIN, UserRole.COORDINATOR, UserRole.SUPERVISOR])
  @ApiOperation({
    summary:
      '[Admin, Coordinator, Supervisor] Get a paginated list of subjects',
  })
  @ApiOkResponse({
    type: GetSubjectsResponseDto,
    description: 'Subjects retrieved successfully',
  })
  async getSubjects(@Query() dto: GetSubjectsQueryDto) {
    return await this.subjectsService.getSubjects(dto);
  }

  @Get('/:id/procedures')
  @ApiOperation({ summary: 'Get procedures for a subject' })
  @ApiParam({ name: 'id', description: 'Subject ID', type: Number })
  @ApiOkResponse({
    description: 'Subject procedures retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        subjectId: { type: 'number', example: 1 },
        subjectName: { type: 'string', example: 'Restorative Dentistry' },
        requiresDentalChart: { type: 'boolean', example: true },
        description: {
          type: 'string',
          example:
            'This subject covers the principles and techniques of restorative dentistry.',
        },
        procedures: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              procedureId: { type: 'number', example: 1 },
              procedureName: { type: 'string', example: 'Composite Filling' },
              requiredCount: { type: 'number', example: 5 },
              description: {
                type: 'string',
                example: 'Direct composite restoration',
              },
            },
          },
        },
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              questionId: { type: 'number', example: 1 },
              questionText: {
                type: 'string',
                example: 'What is the primary purpose of a composite filling?',
              },
              questionType: {
                type: 'string',
                example: 'multiple-choice',
              },
              required: { type: 'boolean', example: true },
              displayOrder: { type: 'number', example: 1 },
              answerOptions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    optionId: { type: 'number', example: 1 },
                    optionText: {
                      type: 'string',
                      example:
                        'To restore the function and appearance of a tooth.',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Subject not found' })
  async getSubjectProcedures(@Param('id', ParseIntPipe) id: number) {
    return await this.subjectsService.getSubjectProcedures(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subject by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Subject ID' })
  @ApiOkResponse({
    type: SubjectItemResponseDto,
    description: 'Subject retrieved successfully',
  })
  @ApiNotFoundResponse({ description: 'Subject not found' })
  async getSubjectById(@Param('id', ParseIntPipe) id: number) {
    return await this.subjectsService.getSubjectById(id);
  }

  @Patch(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Update a subject' })
  @ApiParam({ name: 'id', type: Number, description: 'Subject ID' })
  @ApiBody({ type: UpdateSubjectDto })
  @ApiOkResponse({
    type: UpdateSubjectResponseDto,
    description: 'Subject updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Subject or study year not found' })
  @ApiResponse({
    status: 409,
    description: 'Subject name already exists for this study year',
  })
  async updateSubject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubjectDto,
  ) {
    return await this.subjectsService.updateSubject(id, dto);
  }

  @Delete(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Delete a subject' })
  @ApiParam({ name: 'id', type: Number, description: 'Subject ID' })
  @ApiOkResponse({
    type: DeleteSubjectResponseDto,
    description: 'Subject deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Subject not found' })
  async deleteSubject(@Param('id', ParseIntPipe) id: number) {
    return await this.subjectsService.deleteSubject(id);
  }

  @Get(':id/materials')
  @ApiOperation({ summary: 'Get materials for a subject' })
  @ApiParam({ name: 'id', type: Number, description: 'Subject ID' })
  @ApiOkResponse({
    type: GetSubjectMaterialsResponseDto,
    description: 'Subject materials retrieved successfully',
  })
  @ApiNotFoundResponse({ description: 'Subject not found' })
  async getSubjectMaterials(@Param('id', ParseIntPipe) subjectId: number) {
    return await this.subjectsService.getSubjectMaterials(subjectId);
  }
  @Post(':id/materials')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Add materials to a subject' })
  @ApiParam({ name: 'id', type: Number, description: 'Subject ID' })
  @ApiBody({
    schema: {
      properties: {
        materials: {
          example: [1, 2, 3],
        },
      },
    },
  })
  @ApiOkResponse({
    schema: {
      properties: {
        message: {
          example: {
            message: 'Materials added to subject successfully',
            added: 3,
          },
        },
      },
    },
    description: 'Materials added to subject successfully',
  })
  @ApiNotFoundResponse({ description: 'Subject not found' })
  async addSubjectMaterials(
    @Param('id', ParseIntPipe) subjectId: number,
    @Body() dto: CreateSubjectMaterialsDto,
  ) {
    return await this.subjectsService.addMaterialsToSubject(
      subjectId,
      dto.materials,
    );
  }
}
