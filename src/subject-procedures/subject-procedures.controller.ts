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
import { SubjectProceduresService } from './subject-procedures.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import { CreateSubjectProcedureDto } from './dto/create-subject-procedure.dto';
import { UpdateSubjectProcedureDto } from './dto/update-subject-procedure.dto';
import { GetSubjectProceduresQueryDto } from './dto/get-subject-procedures-query.dto';
import {
  CreateSubjectProcedureResponseDto,
  DeleteSubjectProcedureResponseDto,
  GetSubjectProceduresResponseDto,
  SubjectProcedureItemResponseDto,
  UpdateSubjectProcedureResponseDto,
} from './dto/subject-procedure-response.dto';

@ApiTags('Subject Procedures')
@ApiBearerAuth('JWT-auth')
@Controller('subject-procedures')
export class SubjectProceduresController {
  constructor(
    private readonly subjectProceduresService: SubjectProceduresService,
  ) {}

  @Post()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Create a subject procedure' })
  @ApiBody({ type: CreateSubjectProcedureDto })
  @ApiCreatedResponse({
    type: CreateSubjectProcedureResponseDto,
    description: 'Subject procedure created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  @ApiResponse({
    status: 409,
    description: 'Procedure name already exists for this subject',
  })
  async createSubjectProcedure(@Body() dto: CreateSubjectProcedureDto) {
    return await this.subjectProceduresService.createSubjectProcedure(dto);
  }

  @Get()
  @Roles([UserRole.ADMIN])
  @ApiOperation({
    summary: '[Admin] Get a paginated list of subject procedures',
  })
  @ApiOkResponse({
    type: GetSubjectProceduresResponseDto,
    description: 'Subject procedures retrieved successfully',
  })
  async getSubjectProcedures(@Query() dto: GetSubjectProceduresQueryDto) {
    return await this.subjectProceduresService.getSubjectProcedures(dto);
  }

  @Get(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Get a subject procedure by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Subject procedure ID' })
  @ApiOkResponse({
    type: SubjectProcedureItemResponseDto,
    description: 'Subject procedure retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Subject procedure not found' })
  async getSubjectProcedureById(@Param('id', ParseIntPipe) id: number) {
    return await this.subjectProceduresService.getSubjectProcedureById(id);
  }

  @Patch(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Update a subject procedure' })
  @ApiParam({ name: 'id', type: Number, description: 'Subject procedure ID' })
  @ApiBody({ type: UpdateSubjectProcedureDto })
  @ApiOkResponse({
    type: UpdateSubjectProcedureResponseDto,
    description: 'Subject procedure updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 404,
    description: 'Subject procedure or subject not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Procedure name already exists for this subject',
  })
  async updateSubjectProcedure(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubjectProcedureDto,
  ) {
    return await this.subjectProceduresService.updateSubjectProcedure(id, dto);
  }

  @Delete(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Delete a subject procedure' })
  @ApiParam({ name: 'id', type: Number, description: 'Subject procedure ID' })
  @ApiOkResponse({
    type: DeleteSubjectProcedureResponseDto,
    description: 'Subject procedure deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Subject procedure not found' })
  async deleteSubjectProcedure(@Param('id', ParseIntPipe) id: number) {
    return await this.subjectProceduresService.deleteSubjectProcedure(id);
  }
}
