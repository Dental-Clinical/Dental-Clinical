import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './student.entity';
import {
  DataSource,
  EntityManager,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
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
import { SubjectProcedures } from 'src/subject-procedures/subject-procedures.entity';
import { StudentProgress } from 'src/student-progress/student-progress.entity';
import { GetSupervisorStudentsQueryDto } from './dto/get-supervisor-students-query.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { Subject } from 'src/subjects/subjects.entity';
import { StudyYear } from 'src/study-years/study-years.entity';
import { AcademicYear } from 'src/academic-years/academic-years.entity';

export interface SupervisedStudentSubject extends Pick<
  Subject,
  'id' | 'name' | 'shortName'
> {
  section: Pick<Section, 'id' | 'name'>;
  completedProcedures: number;
  requiredProcedures: number;
  completionPercentage: number;
}

export interface SupervisedStudent extends Pick<
  Student,
  'id' | 'university_id'
> {
  created_at: Date;
  user: Pick<
    User,
    'id' | 'full_name' | 'father_name' | 'email' | 'phone' | 'is_active'
  >;
  studyYear: Pick<StudyYear, 'id' | 'name' | 'level'> | null;
  academicYear: Pick<AcademicYear, 'id' | 'label'>;
  subjects: SupervisedStudentSubject[];
}

export interface SupervisedStudentProcedure extends Pick<
  SubjectProcedures,
  'id' | 'name'
> {
  completed: number;
  required: number;
}

export interface SupervisedStudentDetailSubject extends SupervisedStudentSubject {
  procedures: SupervisedStudentProcedure[];
}

export interface SupervisedStudentDetail extends Pick<Student, 'id'> {
  user: Pick<User, 'id' | 'full_name'>;
  studyYear: Pick<StudyYear, 'id' | 'name' | 'level'> | null;
  academicYear: Pick<AcademicYear, 'id' | 'label'>;
  subjects: SupervisedStudentDetailSubject[];
}

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
    @InjectRepository(SubjectProcedures)
    private readonly subjectProceduresRepository: Repository<SubjectProcedures>,
    @InjectRepository(StudentProgress)
    private readonly studentProgressRepository: Repository<StudentProgress>,
  ) { }
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
      relations: { section: true, supervisor: { user: true } },
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
        requiresDentalChart: enrollment.subject.requiresDentalChart,
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

      const studyYear = await manager.getRepository(StudyYear).findOne({
        where: { level: student.study_year },
      });

      if (!studyYear) {
        throw new NotFoundException(
          `No study year found for level ${student.study_year}`,
        );
      }

      const academicYear = await manager.getRepository(AcademicYear).findOne({
        where: { is_active: true },
      });

      if (!academicYear) {
        throw new NotFoundException('No active academic year is configured');
      }

      const passwordHash = await this.passwordService.hash(
        student.university_id,
      );

      const user = manager.getRepository(User).create({
        full_name: student.full_name,
        father_name: student.father_name,
        email: student.email,
        role: UserRole.STUDENT,
        password_hash: passwordHash,
      });

      const savedUser = await manager.save(user);

      const newStudent = manager.getRepository(Student).create({
        university_id: student.university_id,
        user: savedUser,
      });

      const savedStudent = await manager.save(newStudent);

      const studentAcademicYear = manager
        .getRepository(StudentAcademicYear)
        .create({
          student: savedStudent,
          academicYear,
          studyYear,
          isCurrent: true,
        });

      await manager.save(studentAcademicYear);

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

    const students: any = rows.slice(1).filter((row: any) => row[1]);

    for (const row of students) {
      const fatherName = row[0];
      const fullName = row[1];
      const universityId = String(row[2]);
      const email = String(row[3]);
      const study_year = Number(row[4]);

      await this.createStudent({
        full_name: fullName,
        father_name: fatherName,
        university_id: universityId,
        email,
        study_year
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
  private applySupervisedStudentsFilter(
    qb: SelectQueryBuilder<StudentSubjectEnrollment>,
    userId: number,
    dto: Pick<GetSupervisorStudentsQueryDto, 'search' | 'subject_id'>,
  ) {
    qb.innerJoinAndSelect('enrollment.student', 'student')
      .innerJoinAndSelect('student.user', 'user')
      .innerJoinAndSelect('enrollment.subject', 'subject')
      .innerJoinAndSelect('enrollment.section', 'section')
      .innerJoinAndSelect('enrollment.academicYear', 'academicYear')
      .innerJoin(
        SectionSubject,
        'sectionSubject',
        'sectionSubject.section_id = enrollment.section_id AND sectionSubject.subject_id = enrollment.subject_id AND sectionSubject.academic_year_id = enrollment.academic_year_id',
      )
      .innerJoin('sectionSubject.supervisor', 'supervisor')
      .innerJoin('supervisor.user', 'supervisorUser')
      .where('supervisorUser.id = :userId', { userId })
      .andWhere('academicYear.is_active = true')
      .andWhere('subject.is_active = true')
      .andWhere('user.is_active = true');

    if (dto.search) {
      qb.andWhere(
        '(user.full_name ILIKE :search OR user.father_name ILIKE :search OR student.university_id ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search)',
        { search: `%${dto.search}%` },
      );
    }

    if (dto.subject_id !== undefined) {
      qb.andWhere('subject.id = :subjectId', { subjectId: dto.subject_id });
    }

    return qb;
  }

  private async getProcedureCompletionTotals(
    studentIds: number[],
    subjectIds: number[],
  ) {
    if (studentIds.length === 0 || subjectIds.length === 0) {
      return {
        requiredBySubject: new Map<number, number>(),
        completedByKey: new Map<string, number>(),
      };
    }

    const [requiredRows, completedRows] = await Promise.all([
      this.subjectProceduresRepository
        .createQueryBuilder('subjectProcedure')
        .select('subjectProcedure.subject_id', 'subjectId')
        .addSelect('SUM(subjectProcedure.required_count)', 'required')
        .where('subjectProcedure.subject_id IN (:...subjectIds)', {
          subjectIds,
        })
        .andWhere('subjectProcedure.is_active = true')
        .groupBy('subjectProcedure.subject_id')
        .getRawMany<{ subjectId: string; required: string }>(),
      this.studentProgressRepository
        .createQueryBuilder('progress')
        .select('progress.student_id', 'studentId')
        .addSelect('subjectProcedure.subject_id', 'subjectId')
        .addSelect(
          'SUM(LEAST(progress.completed_count, subjectProcedure.required_count))',
          'completed',
        )
        .innerJoin('progress.subjectProcedure', 'subjectProcedure')
        .where('progress.student_id IN (:...studentIds)', { studentIds })
        .andWhere('subjectProcedure.subject_id IN (:...subjectIds)', {
          subjectIds,
        })
        .andWhere('subjectProcedure.is_active = true')
        .groupBy('progress.student_id')
        .addGroupBy('subjectProcedure.subject_id')
        .getRawMany<{
          studentId: string;
          subjectId: string;
          completed: string;
        }>(),
    ]);

    return {
      requiredBySubject: new Map<number, number>(
        requiredRows.map((row) => [
          Number(row.subjectId),
          Number(row.required),
        ]),
      ),
      completedByKey: new Map<string, number>(
        completedRows.map((row) => [
          `${Number(row.studentId)}-${Number(row.subjectId)}`,
          Number(row.completed),
        ]),
      ),
    };
  }

  public async getSupervisorStudents(
    user: AuthenticatedUser,
    dto: GetSupervisorStudentsQueryDto,
  ) {
    const meta = {
      page: dto.page,
      limit: dto.limit,
      total: 0,
      totalPages: 0,
    };

    const totalRow = await this.applySupervisedStudentsFilter(
      this.enrollmentRepository.createQueryBuilder('enrollment'),
      user.userId,
      dto,
    )
      .select('COUNT(DISTINCT student.id)', 'count')
      .getRawOne<{ count: string }>();

    meta.total = Number(totalRow?.count ?? 0);
    meta.totalPages = Math.ceil(meta.total / dto.limit);

    if (meta.total === 0) {
      return { data: [], meta };
    }

    const idRows = await this.applySupervisedStudentsFilter(
      this.enrollmentRepository.createQueryBuilder('enrollment'),
      user.userId,
      dto,
    )
      .select('student.id', 'studentId')
      .groupBy('student.id')
      .orderBy('student.created_at', 'DESC')
      .offset((dto.page - 1) * dto.limit)
      .limit(dto.limit)
      .getRawMany<{ studentId: string }>();

    const studentIds = idRows.map((row) => Number(row.studentId));

    if (studentIds.length === 0) {
      return { data: [], meta };
    }

    const enrollments = await this.applySupervisedStudentsFilter(
      this.enrollmentRepository.createQueryBuilder('enrollment'),
      user.userId,
      dto,
    )
      .leftJoinAndSelect(
        'student.studentAcademicYears',
        'studentAcademicYear',
        'studentAcademicYear.isCurrent = true',
      )
      .leftJoinAndSelect('studentAcademicYear.studyYear', 'studyYear')
      .andWhere('student.id IN (:...studentIds)', { studentIds })
      .orderBy('student.created_at', 'DESC')
      .addOrderBy('subject.name', 'ASC')
      .getMany();

    const { requiredBySubject, completedByKey } =
      await this.getProcedureCompletionTotals(studentIds, [
        ...new Set(enrollments.map((enrollment) => enrollment.subject.id)),
      ]);

    const students = new Map<number, SupervisedStudent>();

    for (const enrollment of enrollments) {
      const student = enrollment.student;

      if (!students.has(student.id)) {
        const currentEnrollment = student.studentAcademicYears?.find(
          (academicYear) => academicYear.isCurrent,
        );

        students.set(student.id, {
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
          academicYear: {
            id: enrollment.academicYear.id,
            label: enrollment.academicYear.label,
          },
          subjects: [],
        });
      }

      const required = requiredBySubject.get(enrollment.subject.id) ?? 0;
      const completed =
        completedByKey.get(`${student.id}-${enrollment.subject.id}`) ?? 0;

      students.get(student.id)!.subjects.push({
        id: enrollment.subject.id,
        name: enrollment.subject.name,
        shortName: enrollment.subject.shortName,
        section: {
          id: enrollment.section.id,
          name: enrollment.section.name,
        },
        completedProcedures: completed,
        requiredProcedures: required,
        completionPercentage:
          required > 0 ? Math.round((completed / required) * 1000) / 10 : 0,
      });
    }

    return { data: [...students.values()], meta };
  }
  public async getSupervisedStudentDetail(
    user: AuthenticatedUser,
    studentId: number,
    dto: Pick<GetSupervisorStudentsQueryDto, 'subject_id'>,
  ): Promise<SupervisedStudentDetail> {
    let enrollments = await this.applySupervisedStudentsFilter(
      this.enrollmentRepository.createQueryBuilder('enrollment'),
      user.userId,
      {},
    )
      .leftJoinAndSelect(
        'student.studentAcademicYears',
        'studentAcademicYear',
        'studentAcademicYear.isCurrent = true',
      )
      .leftJoinAndSelect('studentAcademicYear.studyYear', 'studyYear')
      .andWhere('student.id = :studentId', { studentId })
      .orderBy('subject.name', 'ASC')
      .getMany();

    if (enrollments.length === 0) {
      const exists = await this.studentRepository.exists({
        where: { id: studentId },
      });

      if (exists) {
        throw new ForbiddenException('You do not supervise this student');
      }

      throw new NotFoundException('Student not found');
    }

    if (dto.subject_id !== undefined) {
      enrollments = enrollments.filter(
        (enrollment) => enrollment.subject.id === dto.subject_id,
      );

      if (enrollments.length === 0) {
        throw new NotFoundException(
          'You do not teach this student this subject',
        );
      }
    }

    const subjectIds = [
      ...new Set(enrollments.map((enrollment) => enrollment.subject.id)),
    ];

    const subjectProcedures = await this.subjectProceduresRepository
      .createQueryBuilder('subjectProcedure')
      .leftJoinAndSelect(
        'subjectProcedure.studentProgress',
        'progress',
        'progress.student_id = :studentId',
        { studentId },
      )
      .where('subjectProcedure.subject_id IN (:...subjectIds)', { subjectIds })
      .andWhere('subjectProcedure.is_active = true')
      .orderBy('subjectProcedure.name', 'ASC')
      .getMany();

    const proceduresBySubject = new Map<number, SubjectProcedures[]>();

    for (const subjectProcedure of subjectProcedures) {
      const forSubject =
        proceduresBySubject.get(subjectProcedure.subject_id) ?? [];
      forSubject.push(subjectProcedure);
      proceduresBySubject.set(subjectProcedure.subject_id, forSubject);
    }

    const student = enrollments[0].student;
    const currentEnrollment = student.studentAcademicYears?.find(
      (academicYear) => academicYear.isCurrent,
    );

    const subjects = enrollments.map((enrollment) => {
      const procedures = (
        proceduresBySubject.get(enrollment.subject.id) ?? []
      ).map((subjectProcedure) => ({
        id: subjectProcedure.id,
        name: subjectProcedure.name,
        completed: subjectProcedure.studentProgress[0]?.completedCount ?? 0,
        required: subjectProcedure.required_count,
      }));

      const requiredProcedures = procedures.reduce(
        (total, procedure) => total + procedure.required,
        0,
      );
      const completedProcedures = procedures.reduce(
        (total, procedure) =>
          total + Math.min(procedure.completed, procedure.required),
        0,
      );

      return {
        id: enrollment.subject.id,
        name: enrollment.subject.name,
        shortName: enrollment.subject.shortName,
        section: {
          id: enrollment.section.id,
          name: enrollment.section.name,
        },
        completedProcedures,
        requiredProcedures,
        completionPercentage:
          requiredProcedures > 0
            ? Math.round((completedProcedures / requiredProcedures) * 1000) / 10
            : 0,
        procedures,
      };
    });

    return {
      id: student.id,
      user: {
        id: student.user.id,
        full_name: student.user.full_name,
      },
      studyYear: currentEnrollment
        ? {
          id: currentEnrollment.studyYear.id,
          name: currentEnrollment.studyYear.name,
          level: currentEnrollment.studyYear.level,
        }
        : null,
      academicYear: {
        id: enrollments[0].academicYear.id,
        label: enrollments[0].academicYear.label,
      },
      subjects,
    };
  }
}
