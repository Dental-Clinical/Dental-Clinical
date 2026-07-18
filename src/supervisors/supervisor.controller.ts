import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SupervisorService } from './supervisor.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { CreateSupervisorResponseDto } from './dto/create-supervisor-response.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@ApiTags('Supervisors')
@ApiBearerAuth('JWT-auth')
@Controller('supervisors')
export class SupervisorController {
  constructor(private readonly supervisorService: SupervisorService) {}

  @Post()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Create a new supervisor' })
  @ApiCreatedResponse({
    type: CreateSupervisorResponseDto,
    description: 'Supervisor created',
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  public async createSupervisor(
    @Body() createSupervisorDto: CreateSupervisorDto,
  ) {
    return await this.supervisorService.createSupervisor(createSupervisorDto);
  }
}
