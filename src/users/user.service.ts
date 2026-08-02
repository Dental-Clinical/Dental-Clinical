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
import { GetUserQueryDto } from './dto/get-user-query.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) { }
  public async getUsers(dto: GetUserQueryDto) {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.full_name',
        'user.father_name',
        'user.email',
        'user.phone',
        'user.role',
        'user.is_active',
        'user.created_at',
      ]);

    if (dto.role) {
      qb.andWhere('user.role = :role', { role: dto.role });
    }

    if (dto.search) {
      qb.andWhere(
        '(user.full_name ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search)',
        { search: `%${dto.search}%` },
      );
    }

    if (dto.is_active !== undefined) {
      qb.andWhere('user.is_active = :is_active', {
        is_active: dto.is_active,
      });
    }

    qb.orderBy('user.created_at', 'DESC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit);

    const [users, total] = await qb.getManyAndCount();

    return {
      data: users,
      meta: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages: Math.ceil(total / dto.limit),
      },
    };
  }
  public async getUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const { password_hash, ...result } = user;
    return result;
  }
  public async updateUserStatus(id: number, status: { is_active: boolean }) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    user.is_active = status.is_active;
    await this.userRepository.save(user);
    return { message: 'User status updated successfully' };
  }
  public async createUser(dto: CreateUserDto): Promise<User> {
    let existingUser: User | null = null;
    if (dto.phone) {
      existingUser = await this.findByPhone(dto.phone);
    }
    if (dto.email) {
      existingUser = await this.findByEmail(dto.email);
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
