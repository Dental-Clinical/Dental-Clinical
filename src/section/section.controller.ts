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
import { SectionService } from './section.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { GetSectionsQueryDto } from './dto/get-section-query.dto';
import {
  CreateSectionResponseDto,
  DeleteSectionResponseDto,
  GetSectionsResponseDto,
  SectionItemResponseDto,
  UpdateSectionResponseDto,
} from './dto/section-response.dto';

@ApiTags('Sections')
@ApiBearerAuth('JWT-auth')
@Controller('sections')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  // @Post()
  // @Roles([UserRole.ADMIN])
  // @ApiOperation({ summary: '[Admin] Create a section' })
  // @ApiBody({ type: CreateSectionDto })
  // @ApiCreatedResponse({
  //   type: CreateSectionResponseDto,
  //   description: 'Section created successfully',
  // })
  // @ApiResponse({ status: 400, description: 'Invalid input data' })
  // @ApiResponse({ status: 404, description: 'Clinic not found' })
  // @ApiResponse({
  //   status: 409,
  //   description: 'Section name already exists for this clinic',
  // })
  // async createSection(@Body() dto: CreateSectionDto) {
  //   return await this.sectionService.createSection(dto);
  // }

  @Get()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Get a paginated list of sections' })
  @ApiOkResponse({
    type: GetSectionsResponseDto,
    description: 'Sections retrieved successfully',
  })
  async getSections(@Query() dto: GetSectionsQueryDto) {
    return await this.sectionService.getSections(dto);
  }

  @Get(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Get a section by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Section ID' })
  @ApiOkResponse({
    type: SectionItemResponseDto,
    description: 'Section retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async getSectionById(@Param('id', ParseIntPipe) id: number) {
    return await this.sectionService.getSectionById(id);
  }

  // @Patch(':id')
  // @Roles([UserRole.ADMIN])
  // @ApiOperation({ summary: '[Admin] Update a section' })
  // @ApiParam({ name: 'id', type: Number, description: 'Section ID' })
  // @ApiBody({ type: UpdateSectionDto })
  // @ApiOkResponse({
  //   type: UpdateSectionResponseDto,
  //   description: 'Section updated successfully',
  // })
  // @ApiResponse({ status: 400, description: 'Invalid input data' })
  // @ApiResponse({ status: 404, description: 'Section or clinic not found' })
  // @ApiResponse({
  //   status: 409,
  //   description: 'Section name already exists for this clinic',
  // })
  // async updateSection(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() dto: UpdateSectionDto,
  // ) {
  //   return await this.sectionService.updateSection(id, dto);
  // }

  @Delete(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Delete a section' })
  @ApiParam({ name: 'id', type: Number, description: 'Section ID' })
  @ApiOkResponse({
    type: DeleteSectionResponseDto,
    description: 'Section deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Section not found' })
  @ApiResponse({
    status: 409,
    description: 'Section still has subjects or student enrollments',
  })
  async deleteSection(@Param('id', ParseIntPipe) id: number) {
    return await this.sectionService.deleteSection(id);
  }
}
