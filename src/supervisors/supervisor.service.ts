import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { UserService } from 'src/users/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Supervisor } from './supervisor.entity';
import { DataSource, Repository } from 'typeorm';
import { PasswordService } from 'src/common/services/password.service';
import { User } from 'src/users/user.entity';
import { randomBytes } from 'crypto';
import { UserRole } from 'src/constants/user-roles';
import { WhatsappService } from 'src/notifications/whatsapp.service';

@Injectable()
export class SupervisorService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly dataSource: DataSource,
    private readonly whatsappService: WhatsappService,
  ) {}
  async createSupervisor(dto: CreateSupervisorDto) {
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
        role: UserRole.SUPERVISOR,
        email: dto.email,
        phone: dto.phone,
        password_hash: passwordHash,
      });

      // this.whatsappService.sendPassword(tempPassword, dto.phone);
      console.log(tempPassword);

      const savedUser = await manager.save(user);

      const newSupervisor = manager.getRepository(Supervisor).create({
        user: savedUser,
      });
      const savedSupervisor = await manager.save(newSupervisor);
      return {
        supervisorId: savedSupervisor.id,
      };
    });
  }
  async findByUserId(userId: number) {
    return await this.dataSource.getRepository(Supervisor).findOne({
      where: { user: { id: userId } },
      relations: {
        user: true,
        schedules: true,
      },
    });
  }
  async findById(id: number) {
    return await this.dataSource.getRepository(Supervisor).findOne({
      where: { id, user: { is_active: true } },
      relations: {
        user: true,
        schedules: true,
      },
    });
  }
}
