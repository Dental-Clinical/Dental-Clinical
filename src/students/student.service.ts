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
import { StudentSubjectEnrollment } from 'src/student-subject-enrollment/student-subject-enrollment.entity';
import { SectionSubject } from 'src/section-subject/section-subject.entity';
import { Section } from 'src/section/section.entity';
import { GetStudentsQueryDto } from './dto/get-students-query.dto';
import { StudentAcademicYear } from 'src/student-academic-years/student-academic-years.entity';

@Injectable()
export class StudentService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly passwordService: PasswordService,
    private readonly dataSource: DataSource,
    @InjectRepository(StudentSubjectEnrollment)
    private readonly enrollmentRepository: Repository<StudentSubjectEnrollment>,
    @InjectRepository(SectionSubject)
    private readonly sectionSubjectRepository: Repository<SectionSubject>,
    @InjectRepository(StudentAcademicYear)
    private readonly studentAcademicYearRepository: Repository<StudentAcademicYear>,
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
    const enrollment = manager
      ? manager.getRepository(StudentAcademicYear)
      : this.studentAcademicYearRepository;
    const currentEnrollment = await enrollment.findOne({
      where: {
        student: { user: { id: userId } },
        isCurrent: true,
      },
      relations: {
        studyYear: true,
      },
    });
    if (!currentEnrollment) {
      throw new NotFoundException(
        'No current enrollment found for this student',
      );
    }
    return currentEnrollment.studyYear;
  }
  /**
   * The student's section for each subject they are enrolled in this academic
   * year, keyed by subject id. Callers mapping over many cases use this to
   * avoid a per-case lookup.
   */
  public async getSectionsBySubjectId(
    userId: number,
  ): Promise<Map<number, Section>> {
    const enrollments = await this.enrollmentRepository.find({
      where: {
        student: { user: { id: userId } },
        academicYear: { is_active: true },
      },
      relations: { subject: true, section: true },
    });

    return new Map(
      enrollments.map((enrollment) => [
        enrollment.subject.id,
        enrollment.section,
      ]),
    );
  }

  /**
   * The offering through which a student takes a subject: their section for it,
   * and the supervisor teaching it there. Resolved in two steps because the
   * student's section and the section's supervisor are separate facts —
   * enrolment says where the student sits, SectionSubject says who teaches it.
   */
  public async getSectionSubjectForStudent(
    userId: number,
    subjectId: number,
    manager?: EntityManager,
  ) {
    const enrollment = await (
      manager
        ? manager.getRepository(StudentSubjectEnrollment)
        : this.enrollmentRepository
    ).findOne({
      where: {
        student: { user: { id: userId } },
        subject: { id: subjectId },
        academicYear: { is_active: true },
      },
      relations: { section: true },
    });

    if (!enrollment) {
      throw new NotFoundException(
        'Student is not enrolled in this subject for the active academic year',
      );
    }

    const sectionSubject = await (
      manager
        ? manager.getRepository(SectionSubject)
        : this.sectionSubjectRepository
    ).findOne({
      where: {
        section: { id: enrollment.section.id },
        subject: { id: subjectId },
        academicYear: { is_active: true },
      },
      relations: { section: true, supervisor: true },
    });

    if (!sectionSubject) {
      throw new NotFoundException(
        'No supervisor is assigned to this subject in the student section',
      );
    }

    return sectionSubject;
  }
  public async getMySubjects(userId: number) {
    const enrollments = await this.enrollmentRepository.find({
      where: {
        student: { user: { id: userId } },
        academicYear: { is_active: true },
        subject: { is_active: true },
      },
      relations: {
        subject: true,
        section: {
          sectionSubjects: {
            subject: true,
            supervisor: { user: true },
          },
        },
      },
    });
    if (!enrollments || enrollments.length === 0) {
      throw new NotFoundException('No subjects found for this student');
    }

    return {
      subjects: enrollments.map((enrollment) => ({
        id: enrollment.subject.id,
        name: enrollment.subject.name,
        shortName: enrollment.subject.shortName,
        section: enrollment.section.name,
        supervisor:
          enrollment.section.sectionSubjects.find(
            (ss) => ss.subject.id === enrollment.subject.id,
          )?.supervisor.user.full_name || null,
      })),
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

  async getAllStudents(dto: GetStudentsQueryDto) {
    const qb = this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect(
        'student.studentAcademicYears',
        'enrollment',
        'enrollment.isCurrent = true',
      )
      .leftJoinAndSelect('enrollment.studyYear', 'studyYear');

    if (dto.search) {
      qb.andWhere(
        '(user.full_name ILIKE :search OR user.father_name ILIKE :search OR student.university_id ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search)',
        { search: `%${dto.search}%` },
      );
    }

    if (dto.study_year_id !== undefined) {
      qb.andWhere('enrollment.study_year_id = :studyYearId', {
        studyYearId: dto.study_year_id,
      });
    }

    if (dto.academic_year_id !== undefined) {
      qb.andWhere('enrollment.academic_year_id = :academicYearId', {
        academicYearId: dto.academic_year_id,
      });
    }

    if (dto.is_active !== undefined) {
      qb.andWhere('user.is_active = :is_active', { is_active: dto.is_active });
    }

    qb.orderBy('student.created_at', 'DESC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit);

    const [students, total] = await qb.getManyAndCount();

    const data = students.map((student) => {
      const currentEnrollment = student.studentAcademicYears?.find(
        (enrollment) => enrollment.isCurrent,
      );
      return {
        id: student.id,
        university_id: student.university_id,
        created_at: student.created_at,
        user: {
          id: student.user.id,
          full_name: student.user.full_name,
          father_name: student.user.father_name,
          email: student.user.email,
          phone: student.user.phone,
          is_active: student.user.is_active,
        },
        studyYear: currentEnrollment
          ? {
              id: currentEnrollment.studyYear.id,
              name: currentEnrollment.studyYear.name,
              level: currentEnrollment.studyYear.level,
            }
          : null,
      };
    });

    return {
      data,
      meta: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages: Math.ceil(total / dto.limit),
      },
    };
  }
}
