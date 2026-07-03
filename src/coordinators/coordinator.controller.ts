import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CoordinatorService } from './coordinator.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import { CreateCoordinatorDto } from './dto/create-coordinator.dto';
import { CreateCoordinatorResponseDto } from './dto/create-coordinator-response.dto';

@ApiTags('Coordinators')
@ApiBearerAuth('JWT-auth')
@Controller('coordinators')
export class CoordinatorController {
  constructor(private readonly coordinatorService: CoordinatorService) {}

  @Post()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Create a new coordinator' })
  @ApiCreatedResponse({
    type: CreateCoordinatorResponseDto,
    description: 'Coordinator created',
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  public async createCoordinator(
    @Body() createCoordinatorDto: CreateCoordinatorDto,
  ) {
    return await this.coordinatorService.createCoordinator(
      createCoordinatorDto,
    );
  }
}
