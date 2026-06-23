import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}
  public async findByUniId(uniId: string) {
    return await this.studentRepository.findOne({
      where: { university_id: uniId },
      relations: {
        user: true,
      },
    });
  }
}
