import { Body, Controller, Post } from '@nestjs/common';
import { CoordinatorService } from './coordinator.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import { CreateCoordinatorDto } from './dto/create-coordinator.dto';

@Controller('coordinators')
export class CoordinatorController {
  constructor(private readonly coordinatorService: CoordinatorService) {}
  @Post()
  @Roles([UserRole.ADMIN])
  public async createCoordinator(
    @Body() createCoordinatorDto: CreateCoordinatorDto,
  ) {
    return await this.coordinatorService.createCoordinator(
      createCoordinatorDto,
    );
  }
}
