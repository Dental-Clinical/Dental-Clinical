import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UserService } from 'src/users/user.service';
import { UserRole } from 'src/constants/user-roles';
import { randomBytes } from 'crypto';
import { PasswordService } from 'src/common/services/password.service';
// import { DataSource } from 'typeorm/browser';

@Injectable()
export class StudentService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly passwordService: PasswordService,
    private readonly dataSource: DataSource,
  ) {}
  public async findByUniversityId(university_id: string) {
    return await this.studentRepository.findOne({
      where: { university_id },
      relations: {
        user: true,
      },
    });
  }
  public async createStudent(student: CreateStudentDto) {
    return await this.dataSource.transaction(async (manager) => {
      const existingStudent = await manager.getRepository(Student).findOne({
        where: { university_id: student.university_id },
      });

      if (existingStudent) {
        throw new HttpException('Student already exists', HttpStatus.CONFLICT);
      }

      const passwordHash = await this.passwordService.hash(
        student.university_id,
      );

      const user = manager.getRepository(User).create({
        first_name: student.first_name,
        last_name: student.last_name,
        role: UserRole.STUDENT,
        password_hash: passwordHash,
      });

      const savedUser = await manager.save(user);

      const newStudent = manager.getRepository(Student).create({
        university_id: student.university_id,
        user: savedUser,
      });
      const savedStudent = await manager.save(newStudent);
      return {
        studentId: savedStudent.id,
      };
    });
  }
}
