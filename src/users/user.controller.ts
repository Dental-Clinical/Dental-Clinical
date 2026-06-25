import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import { UserService } from './user.service';
import { GetUserQueryDto } from './dto/get-user-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  @Roles([UserRole.ADMIN])
  async getUsers(@Query() query: GetUserQueryDto) {
    return await this.userService.getUsers(query);
  }
  @Get(':id')
  @Roles([UserRole.ADMIN])
  async getUserById(@Param() param: { id: number }) {
    return await this.userService.getUserById(param.id);
  }
  @Patch(':id/status')
  @Roles([UserRole.ADMIN])
  async updateUserStatus(
    @Param() param: { id: number },
    @Body() status: { is_active: boolean },
  ) {
    return await this.userService.updateUserStatus(param.id, status);
  }
}
