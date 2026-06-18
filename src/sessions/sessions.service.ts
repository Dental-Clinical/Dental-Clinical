import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { Session } from './session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>,
  ) {}
  async createSession(
    user: User,
    jti: string,
    deviceInfo: string,
    expiresAt: Date,
  ): Promise<Session> {
    try {
      const session = this.sessionsRepository.create({
        user,
        jti,
        device_info: deviceInfo,
        expires_at: expiresAt,
      });
      return await this.sessionsRepository.save(session);
    } catch (error) {
      throw error;
    }
  }
  async findByJti(jti: string): Promise<Session> {
    try {
      const session = await this.sessionsRepository.findOneBy({ jti });
      if (!session) {
        throw new NotFoundException('Session not found');
      }
      return session;
    } catch (error) {
      throw error;
    }
  }
  async deleteSessionByJti(jti: string): Promise<void> {
    try {
      const result = await this.sessionsRepository.delete({ jti });
      if (result.affected === 0) {
        throw new NotFoundException('Session not found');
      }
    } catch (error) {
      throw error;
    }
  }
  async deleteSessionsByUserId(userId: number): Promise<void> {
    try {
      await this.sessionsRepository
        .createQueryBuilder()
        .delete()
        .from(Session)
        .where('userId = :userId', { userId })
        .execute();
    } catch (error) {
      throw error;
    }
  }
}
