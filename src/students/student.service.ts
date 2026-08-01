import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UserService } from 'src/users/user.service';
import { UserRole } from 'src/constants/user-roles';
import { randomBytes } from 'crypto';
import { PasswordService } from 'src/common/services/password.service';
import * as xlsx from 'xlsx';
import { StudentSection } from 'src/student-section/student-section.entity';
import { Subject } from '../subjects/subjects.entity';

@Injectable()
export class StudentService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly passwordService: PasswordService,
    private readonly dataSource: DataSource,
    @InjectRepository(StudentSection)
    private readonly studentSectionRepository: Repository<StudentSection>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}
  public async findByUniversityId(university_id: string) {
    return await this.studentRepository.findOne({
      where: { university_id },
      relations: {
        user: true,
      },
    });
  }
  public async findByUserId(id: number, manager?: EntityManager) {
    return await (
      manager ? manager.getRepository(Student) : this.studentRepository
    ).findOne({
      where: {
        user: { id, is_active: true },
        studentAcademicYears: { isCurrent: true },
      },
      relations: {
        user: true,
        studentAcademicYears: { studyYear: true },
      },
    });
  }
  public async getCurrentStudyYear(userId: number, manager?: EntityManager) {
    const student = await (
      manager ? manager.getRepository(Student) : this.studentRepository
    ).findOne({
      where: {
        user: { id: userId },
        studentAcademicYears: { isCurrent: true },
      },
      relations: {
        studentAcademicYears: { studyYear: true },
      },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    const currentEnrollment = student.studentAcademicYears.find(
      (enrollment) => enrollment.isCurrent,
    );
    if (!currentEnrollment) {
      throw new NotFoundException('Current enrollment not found for student');
    }
    return currentEnrollment.studyYear;
  }
  public async getClinicSectionForSubject(
    userId: number,
    subjectId: number,
    manager?: EntityManager,
  ) {
    const subject = await (
      manager ? manager.getRepository(Subject) : this.subjectRepository
    ).findOne({
      where: {
        id: subjectId,
        section: {
          studentSections: {
            studentAcademicYear: {
              isCurrent: true,
              student: {
                user: {
                  id: userId,
                },
              },
            },
          },
        },
      },
      relations: {
        section: {
          supervisor: true,
          studentSections: true,
        },
      },
    });
    if (!subject) {
      throw new NotFoundException(
        'Current student section not found for the given subject',
      );
    }
    return subject.section;
  }
  public async getMySubjects(userId: number) {
    const subjects = await this.subjectRepository.find({
      where: {
        is_active: true,
        section: {
          studentSections: {
            studentAcademicYear: {
              isCurrent: true,
              student: {
                user: {
                  id: userId,
                },
              },
            },
          },
        },
        studyYear: {
          studentAcademicYears: {
            isCurrent: true,
            student: {
              user: {
                id: userId,
              },
            },
          },
        },
      },
    });

    const result = subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
    }));
    return {
      subjects: result,
    };
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
        full_name: student.full_name,
        father_name: student.father_name,
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
  async importStudents(file: Express.Multer.File) {
    const workbook = xlsx.read(file.buffer, {
      type: 'buffer',
    });

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = xlsx.utils.sheet_to_json(worksheet, {
      header: 1,
    });

    const students: any = rows.slice(3).filter((row: any) => row[1] && row[2]);

    for (const row of students) {
      const fatherName = row[0];
      const fullName = row[1];
      const universityId = String(row[2]);

      await this.createStudent({
        full_name: fullName,
        father_name: fatherName,
        university_id: universityId,
      });
    }
  }
}
