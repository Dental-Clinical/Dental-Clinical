import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { InitialExaminationService } from './initial-examination.service';
import { CreateInitialExaminationDto } from './dto/create-initatil-examination.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/users/user.entity';
import { UpdateInitialExaminationDto } from './dto/update-initial-examination.dto';

@ApiTags('Initial Examination')
@ApiBearerAuth('JWT-auth')
@Controller('initial-examination')
export class InitialExaminationController {
  constructor(private initialExaminationService: InitialExaminationService) { }

  @Post()
  @Roles([UserRole.COORDINATOR])
  @ApiOperation({ summary: 'Create an initial examination' })
  @ApiCreatedResponse({ description: 'Initial examination created successfully' })
  @ApiResponse({ status: 404, description: 'Examination Request, Appointment, or Coordinator not found' })
  @ApiResponse({ status: 409, description: 'An Initial Examination already exists for this Examination Request' })
  async createInitialExamination(@Body() dto: CreateInitialExaminationDto) {
    return this.initialExaminationService.createInitialExamination(dto)
  }

  @Get(':id')
  @Roles([UserRole.COORDINATOR, UserRole.SUPERVISOR])
  async getInitialExamination(@Param('id', ParseIntPipe) id: number) {
    return await this.initialExaminationService.getInitialExamination(id)
  }

  @Get(':id')
  @Roles([UserRole.STUDENT])
  async getInitialExaminationForStudent(@Param('id', ParseIntPipe) id: number) {
    // TODO 
  }

  @Patch(':id')
  @Roles([UserRole.COORDINATOR])
  async editInitialExamination(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInitialExaminationDto) {
    //
  }


}
