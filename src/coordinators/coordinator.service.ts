import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCoordinatorDto } from './dto/create-coordinator.dto';
import { PasswordService } from 'src/common/services/password.service';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { randomBytes } from 'crypto';
import { UserRole } from 'src/constants/user-roles';
import { Coordinator } from './coordinator.entity';
import { WhatsappService } from 'src/notifications/whatsapp.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CoordinatorService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly dataSource: DataSource,
    private readonly whatsappService: WhatsappService,
    @InjectRepository(Coordinator)
    private readonly coordinatorRepository: Repository<Coordinator>,
  ) {}
  async createCoordinator(dto: CreateCoordinatorDto) {
    return await this.dataSource.transaction(async (manager) => {
      dto.email = dto.email.trim().toLowerCase();
      dto.phone = dto.phone.replace(/\D/g, '');

      const existingUser = await manager.getRepository(User).findOne({
        where: { email: dto.email },
      });
      if (existingUser) {
        throw new HttpException('User already exists', HttpStatus.CONFLICT);
      }

      const tempPassword = randomBytes(8).toString('hex');

      const passwordHash = await this.passwordService.hash(tempPassword);

      const user = manager.getRepository(User).create({
        full_name: dto.full_name,
        father_name: dto.father_name,
        role: UserRole.COORDINATOR,
        email: dto.email,
        phone: dto.phone,
        password_hash: passwordHash,
      });
      // this.whatsappService.sendPassword(tempPassword, dto.phone);
      console.log(tempPassword);

      const savedUser = await manager.save(user);

      const newCoordinator = manager.getRepository(Coordinator).create({
        user: savedUser,
      });
      const savedCoordinator = await manager.save(newCoordinator);
      return {
        coordinatorId: savedCoordinator.id,
      };
    });
  }
  async findByUserId(userId: number) {
    return await this.coordinatorRepository.findOne({
      where: { user: { id: userId } },
    });
  }
}
