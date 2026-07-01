import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/constants/user-roles';

export const Roles = Reflector.createDecorator<UserRole[]>();
