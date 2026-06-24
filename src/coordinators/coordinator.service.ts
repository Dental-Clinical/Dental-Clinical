import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCoordinatorDto } from './dto/create-coordinator.dto';
import { PasswordService } from 'src/common/services/password.service';
import { DataSource } from 'typeorm';
import { User } from 'src/users/user.entity';
import { randomBytes } from 'crypto';
import { UserRole } from 'src/constants/user-roles';
import { Coordinator } from './coordinator.entity';

@Injectable()
export class CoordinatorService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly dataSource: DataSource,
  ) {}
  async createCoordinator(dto: CreateCoordinatorDto) {
    return await this.dataSource.transaction(async (manager) => {
      dto.email = dto.email.trim().toLowerCase();

      const existingUser = await manager.getRepository(User).findOne({
        where: { email: dto.email },
      });
      if (existingUser) {
        throw new HttpException('User already exists', HttpStatus.CONFLICT);
      }

      const tempPassword = randomBytes(8).toString('hex');

      const passwordHash = await this.passwordService.hash(tempPassword);

      const user = manager.getRepository(User).create({
        first_name: dto.first_name,
        last_name: dto.last_name,
        role: UserRole.COORDINATOR,
        email: dto.email,
        password_hash: passwordHash,
      });

      const savedUser = await manager.save(user);

      const newCoordinator = manager.getRepository(Coordinator).create({
        user: savedUser,
      });
      const savedCoordinator = await manager.save(newCoordinator);
      return {
        coordinatorId: savedCoordinator.id,
        tempPassword,
      };
    });
  }
}
