import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentSection } from './student-section.entity';
import { StudentAcademicYear } from 'src/student-academic-years/student-academic-years.entity';
import { ClinicSections } from 'src/clinic-sections/clinic-sections.entity';
import { CreateStudentSectionDto } from './dto/create-student-section.dto';
import { UpdateStudentSectionDto } from './dto/update-student-section.dto';
import { GetStudentSectionsQueryDto } from './dto/get-student-sections-query.dto';

@Injectable()
export class StudentSectionService {
  constructor(
    @InjectRepository(StudentSection)
    private readonly studentSectionRepository: Repository<StudentSection>,
    @InjectRepository(StudentAcademicYear)
    private readonly studentAcademicYearRepository: Repository<StudentAcademicYear>,
    @InjectRepository(ClinicSections)
    private readonly clinicSectionRepository: Repository<ClinicSections>,
  ) {}

  async getStudentSections(dto: GetStudentSectionsQueryDto) {
    const qb =
      this.studentSectionRepository.createQueryBuilder('studentSection');

    if (dto.student_academic_year_id !== undefined) {
      qb.andWhere(
        'studentSection.student_academic_year_id = :studentAcademicYearId',
        { studentAcademicYearId: dto.student_academic_year_id },
      );
    }

    if (dto.clinic_section_id !== undefined) {
      qb.andWhere('studentSection.clinic_section_id = :clinicSectionId', {
        clinicSectionId: dto.clinic_section_id,
      });
    }

    qb.orderBy('studentSection.createdAt', 'DESC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit);

    const [studentSections, total] = await qb.getManyAndCount();

    return {
      message: 'Student sections retrieved successfully',
      data: studentSections,
      meta: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages: Math.ceil(total / dto.limit),
      },
    };
  }

  async getStudentSectionById(id: number) {
    const studentSection = await this.studentSectionRepository.findOne({
      where: { id },
    });

    if (!studentSection) {
      throw new NotFoundException('Student section not found');
    }

    return {
      message: 'Student section retrieved successfully',
      data: studentSection,
    };
  }

  async createStudentSection(dto: CreateStudentSectionDto) {
    const studentAcademicYear = await this.resolveStudentAcademicYear(
      dto.student_academic_year_id,
    );
    const clinicSection = await this.resolveClinicSection(
      dto.clinic_section_id,
    );

    const existing = await this.studentSectionRepository.findOne({
      where: {
        studentAcademicYear: { id: dto.student_academic_year_id },
        clinicSection: { id: dto.clinic_section_id },
      },
    });
    if (existing) {
      throw new ConflictException(
        'This student is already assigned to this clinic section',
      );
    }

    const studentSection = this.studentSectionRepository.create({
      studentAcademicYear,
      clinicSection,
    });

    try {
      const saved = await this.studentSectionRepository.save(studentSection);
      return {
        message: 'Student section created successfully',
        data: saved,
      };
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(
          'This student is already assigned to this clinic section',
        );
      }
      throw error;
    }
  }

  async updateStudentSection(id: number, dto: UpdateStudentSectionDto) {
    const studentSection = await this.studentSectionRepository.findOne({
      where: { id },
    });

    if (!studentSection) {
      throw new NotFoundException('Student section not found');
    }

    if (dto.student_academic_year_id !== undefined) {
      studentSection.studentAcademicYear =
        await this.resolveStudentAcademicYear(dto.student_academic_year_id);
    }
    if (dto.clinic_section_id !== undefined) {
      studentSection.clinicSection = await this.resolveClinicSection(
        dto.clinic_section_id,
      );
    }

    const targetStudentAcademicYearId =
      dto.student_academic_year_id ?? studentSection.student_academic_year_id;
    const targetClinicSectionId =
      dto.clinic_section_id ?? studentSection.clinic_section_id;

    if (
      (dto.student_academic_year_id !== undefined ||
        dto.clinic_section_id !== undefined) &&
      (targetStudentAcademicYearId !==
        studentSection.student_academic_year_id ||
        targetClinicSectionId !== studentSection.clinic_section_id)
    ) {
      const existing = await this.studentSectionRepository.findOne({
        where: {
          studentAcademicYear: { id: targetStudentAcademicYearId },
          clinicSection: { id: targetClinicSectionId },
        },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          'This student is already assigned to this clinic section',
        );
      }
    }

    try {
      const updated = await this.studentSectionRepository.save(studentSection);
      return {
        message: 'Student section updated successfully',
        data: updated,
      };
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(
          'This student is already assigned to this clinic section',
        );
      }
      throw error;
    }
  }

  async deleteStudentSection(id: number) {
    const studentSection = await this.studentSectionRepository.findOne({
      where: { id },
    });

    if (!studentSection) {
      throw new NotFoundException('Student section not found');
    }

    await this.studentSectionRepository.remove(studentSection);

    return {
      message: 'Student section deleted successfully',
    };
  }

  private async resolveStudentAcademicYear(studentAcademicYearId: number) {
    const studentAcademicYear =
      await this.studentAcademicYearRepository.findOne({
        where: { id: studentAcademicYearId },
      });
    if (!studentAcademicYear) {
      throw new NotFoundException('Student academic year not found');
    }
    return studentAcademicYear;
  }

  private async resolveClinicSection(clinicSectionId: number) {
    const clinicSection = await this.clinicSectionRepository.findOne({
      where: { id: clinicSectionId },
    });
    if (!clinicSection) {
      throw new NotFoundException('Clinic section not found');
    }
    return clinicSection;
  }
}
