import { Body, Controller, Post } from '@nestjs/common';
import { SupervisorService } from './supervisor.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';

@Controller('supervisors')
export class SupervisorController {
  constructor(private readonly supervisorService: SupervisorService) {}
  @Post()
  @Roles([UserRole.ADMIN])
  public async createSupervisor(
    @Body() createSupervisorDto: CreateSupervisorDto,
  ) {
    return await this.supervisorService.createSupervisor(createSupervisorDto);
  }
}
