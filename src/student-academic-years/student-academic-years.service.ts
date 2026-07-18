import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentAcademicYear } from './student-academic-years.entity';
import { Student } from 'src/students/student.entity';
import { AcademicYear } from 'src/academic-years/academic-years.entity';
import { StudyYear } from 'src/study-years/study-years.entity';
import { CreateStudentAcademicYearDto } from './dto/create-student-academic-year.dto';
import { UpdateStudentAcademicYearDto } from './dto/update-student-academic-year.dto';
import { GetStudentAcademicYearsQueryDto } from './dto/get-student-academic-years-query.dto';

@Injectable()
export class StudentAcademicYearsService {
  constructor(
    @InjectRepository(StudentAcademicYear)
    private readonly studentAcademicYearRepository: Repository<StudentAcademicYear>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,
    @InjectRepository(StudyYear)
    private readonly studyYearRepository: Repository<StudyYear>,
  ) {}

  async getStudentAcademicYears(dto: GetStudentAcademicYearsQueryDto) {
    const qb = this.studentAcademicYearRepository.createQueryBuilder(
      'studentAcademicYear',
    );

    if (dto.student_id !== undefined) {
      qb.andWhere('studentAcademicYear.student_id = :studentId', {
        studentId: dto.student_id,
      });
    }

    if (dto.academic_year_id !== undefined) {
      qb.andWhere('studentAcademicYear.academic_year_id = :academicYearId', {
        academicYearId: dto.academic_year_id,
      });
    }

    if (dto.study_year_id !== undefined) {
      qb.andWhere('studentAcademicYear.study_year_id = :studyYearId', {
        studyYearId: dto.study_year_id,
      });
    }

    if (dto.isCurrent !== undefined) {
      qb.andWhere('studentAcademicYear.isCurrent = :isCurrent', {
        isCurrent: dto.isCurrent,
      });
    }

    qb.orderBy('studentAcademicYear.createdAt', 'DESC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit);

    const [studentAcademicYears, total] = await qb.getManyAndCount();

    return {
      message: 'Student academic years retrieved successfully',
      data: studentAcademicYears,
      meta: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages: Math.ceil(total / dto.limit),
      },
    };
  }

  async getStudentAcademicYearById(id: number) {
    const studentAcademicYear =
      await this.studentAcademicYearRepository.findOne({
        where: { id },
      });

    if (!studentAcademicYear) {
      throw new NotFoundException('Student academic year not found');
    }

    return {
      message: 'Student academic year retrieved successfully',
      data: studentAcademicYear,
    };
  }

  async createStudentAcademicYear(dto: CreateStudentAcademicYearDto) {
    const student = await this.resolveStudent(dto.student_id);
    const academicYear = await this.resolveAcademicYear(dto.academic_year_id);
    const studyYear = await this.resolveStudyYear(dto.study_year_id);

    const existing = await this.studentAcademicYearRepository.findOne({
      where: {
        student: { id: dto.student_id },
        academicYear: { id: dto.academic_year_id },
      },
    });
    if (existing) {
      throw new ConflictException(
        'This student is already enrolled in this academic year',
      );
    }

    const studentAcademicYear = this.studentAcademicYearRepository.create({
      isCurrent: dto.isCurrent,
      student,
      academicYear,
      studyYear,
    });

    try {
      const saved =
        await this.studentAcademicYearRepository.save(studentAcademicYear);
      return {
        message: 'Student academic year created successfully',
        data: saved,
      };
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(
          'This student is already enrolled in this academic year',
        );
      }
      throw error;
    }
  }

  async updateStudentAcademicYear(
    id: number,
    dto: UpdateStudentAcademicYearDto,
  ) {
    const studentAcademicYear =
      await this.studentAcademicYearRepository.findOne({
        where: { id },
      });

    if (!studentAcademicYear) {
      throw new NotFoundException('Student academic year not found');
    }

    if (dto.student_id !== undefined) {
      studentAcademicYear.student = await this.resolveStudent(dto.student_id);
    }
    if (dto.academic_year_id !== undefined) {
      studentAcademicYear.academicYear = await this.resolveAcademicYear(
        dto.academic_year_id,
      );
    }
    if (dto.study_year_id !== undefined) {
      studentAcademicYear.studyYear = await this.resolveStudyYear(
        dto.study_year_id,
      );
    }

    const targetStudentId = dto.student_id ?? studentAcademicYear.student_id;
    const targetAcademicYearId =
      dto.academic_year_id ?? studentAcademicYear.academic_year_id;

    if (
      (dto.student_id !== undefined || dto.academic_year_id !== undefined) &&
      (targetStudentId !== studentAcademicYear.student_id ||
        targetAcademicYearId !== studentAcademicYear.academic_year_id)
    ) {
      const existing = await this.studentAcademicYearRepository.findOne({
        where: {
          student: { id: targetStudentId },
          academicYear: { id: targetAcademicYearId },
        },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          'This student is already enrolled in this academic year',
        );
      }
    }

    if (dto.isCurrent !== undefined) {
      studentAcademicYear.isCurrent = dto.isCurrent;
    }

    try {
      const updated =
        await this.studentAcademicYearRepository.save(studentAcademicYear);
      return {
        message: 'Student academic year updated successfully',
        data: updated,
      };
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(
          'This student is already enrolled in this academic year',
        );
      }
      throw error;
    }
  }

  async deleteStudentAcademicYear(id: number) {
    const studentAcademicYear =
      await this.studentAcademicYearRepository.findOne({
        where: { id },
      });

    if (!studentAcademicYear) {
      throw new NotFoundException('Student academic year not found');
    }

    await this.studentAcademicYearRepository.remove(studentAcademicYear);

    return {
      message: 'Student academic year deleted successfully',
    };
  }

  private async resolveStudent(studentId: number) {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return student;
  }

  private async resolveAcademicYear(academicYearId: number) {
    const academicYear = await this.academicYearRepository.findOne({
      where: { id: academicYearId },
    });
    if (!academicYear) {
      throw new NotFoundException('Academic year not found');
    }
    return academicYear;
  }

  private async resolveStudyYear(studyYearId: number) {
    const studyYear = await this.studyYearRepository.findOne({
      where: { id: studyYearId },
    });
    if (!studyYear) {
      throw new NotFoundException('Study year not found');
    }
    return studyYear;
  }
}
