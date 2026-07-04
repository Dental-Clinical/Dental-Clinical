import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import { UserService } from './user.service';
import { GetUserQueryDto } from './dto/get-user-query.dto';
import {
  PaginatedUsersResponseDto,
  UserResponseDto,
} from './dto/user-response.dto';
import { UpdateUserStatusResponseDto } from './dto/update-user-status-response.dto';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Get all users (paginated)' })
  @ApiOkResponse({
    type: PaginatedUsersResponseDto,
    description: 'Paginated list of users',
  })
  async getUsers(@Query() query: GetUserQueryDto) {
    return await this.userService.getUsers(query);
  }

  @Get(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiOkResponse({ type: UserResponseDto, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param() param: { id: number }) {
    return await this.userService.getUserById(param.id);
  }

  @Patch(':id/status')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Update user active status' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        is_active: { type: 'boolean', example: true },
      },
    },
  })
  @ApiOkResponse({
    type: UpdateUserStatusResponseDto,
    description: 'Status updated',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserStatus(
    @Param() param: { id: number },
    @Body() status: { is_active: boolean },
  ) {
    return await this.userService.updateUserStatus(param.id, status);
  }
}
