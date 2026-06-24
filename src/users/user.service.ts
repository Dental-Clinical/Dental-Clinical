import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UserRole } from 'src/constants/user-roles';
import { randomBytes } from 'crypto';
import { PasswordService } from 'src/common/services/password.service';
import { StudentService } from 'src/students/student.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  public async createUser(dto: CreateUserDto): Promise<User> {
    let existingUser: User | null = null;
    if (dto.phone) {
      existingUser = await this.findByPhone(dto.phone!);
    }
    if (dto.email) {
      existingUser = await this.findByEmail(dto.email!);
    }

    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    const user = this.userRepository.create(dto);

    return await this.userRepository.save(user);
  }
  public async findByPhone(phone: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ phone });
  }
  public async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ email });
  }
}
