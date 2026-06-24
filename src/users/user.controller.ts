import { Controller, Post } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { CreateStaffDto } from './dto/create-staff.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
}
