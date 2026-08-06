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
import { MaterialsService } from './materials.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { GetMaterialsQueryDto } from './dto/get-material-query.dto';
import {
  CreateMaterialResponseDto,
  DeleteMaterialResponseDto,
  GetMaterialByIdResponseDto,
  GetMaterialsResponseDto,
  UpdateMaterialResponseDto,
} from './dto/material-resonse.dto';

@ApiTags('Materials')
@ApiBearerAuth('JWT-auth')
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Create a material' })
  @ApiBody({ type: CreateMaterialDto })
  @ApiCreatedResponse({
    type: CreateMaterialResponseDto,
    description: 'Material created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Material name already exists' })
  async createMaterial(@Body() dto: CreateMaterialDto) {
    return await this.materialsService.createMaterial(dto);
  }

  @Get()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Get a paginated list of materials' })
  @ApiOkResponse({
    type: GetMaterialsResponseDto,
    description: 'Materials retrieved successfully',
  })
  async getMaterials(@Query() dto: GetMaterialsQueryDto) {
    return await this.materialsService.getMaterials(dto);
  }

  @Get(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Get a material by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Material ID' })
  @ApiOkResponse({
    type: GetMaterialByIdResponseDto,
    description: 'Material retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Material not found' })
  async getMaterialById(@Param('id', ParseIntPipe) id: number) {
    return await this.materialsService.getMaterialById(id);
  }

  @Patch(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Update a material' })
  @ApiParam({ name: 'id', type: Number, description: 'Material ID' })
  @ApiBody({ type: UpdateMaterialDto })
  @ApiOkResponse({
    type: UpdateMaterialResponseDto,
    description: 'Material updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Material not found' })
  @ApiResponse({ status: 409, description: 'Material name already exists' })
  async updateMaterial(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMaterialDto,
  ) {
    return await this.materialsService.updateMaterial(id, dto);
  }

  @Delete(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Delete a material' })
  @ApiParam({ name: 'id', type: Number, description: 'Material ID' })
  @ApiOkResponse({
    type: DeleteMaterialResponseDto,
    description: 'Material deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Material not found' })
  @ApiResponse({
    status: 409,
    description: 'Material is still used by subjects or treatment sessions',
  })
  async deleteMaterial(@Param('id', ParseIntPipe) id: number) {
    return await this.materialsService.deleteMaterial(id);
  }
}
