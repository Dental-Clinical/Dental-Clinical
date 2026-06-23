import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  public async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByPhone(createUserDto.phone);
    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    const user = this.userRepository.create(createUserDto);

    if (!user) {
      throw new HttpException(
        'User creation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return await this.userRepository.save(user);
  }
  public async findByPhone(phone: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ phone });
  }
  public async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ email });
  }
}
