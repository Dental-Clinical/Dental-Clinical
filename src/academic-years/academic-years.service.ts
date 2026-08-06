import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AcademicYear } from './academic-years.entity';
import { DataSource, In, LessThan, Repository } from 'typeorm';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';
import { GetAcademicYearsQueryDto } from './dto/get-academic-years-query.dto';
import { SectionSubject } from 'src/section-subject/section-subject.entity';

@Injectable()
export class AcademicYearsService {
  constructor(
    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,
    private readonly dataSource: DataSource,
  ) {}

  async getAcademicYears(dto: GetAcademicYearsQueryDto) {
    const qb = this.academicYearRepository.createQueryBuilder('academicYear');

    if (dto.search) {
      qb.andWhere('academicYear.label ILIKE :search', {
        search: `%${dto.search}%`,
      });
    }

    if (dto.is_active !== undefined) {
      qb.andWhere('academicYear.is_active = :is_active', {
        is_active: dto.is_active,
      });
    }

    qb.orderBy('academicYear.start_date', 'DESC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit);

    const [academicYears, total] = await qb.getManyAndCount();

    return {
      message: 'Academic years retrieved successfully',
      academicYears: academicYears.map((academicYear) => ({
        id: academicYear.id,
        label: academicYear.label,
        start_date: academicYear.start_date,
        end_date: academicYear.end_date,
        is_active: academicYear.is_active,
      })),
      meta: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages: Math.ceil(total / dto.limit),
      },
    };
  }

  async getAcademicYearById(id: number) {
    const academicYear = await this.academicYearRepository.findOne({
      where: { id },
    });

    if (!academicYear) {
      throw new NotFoundException('Academic year not found');
    }

    return {
      message: 'Academic year retrieved successfully',
      data: academicYear,
    };
  }

  async createAcademicYear(dto: CreateAcademicYearDto) {
    this.validateDateRange(dto.start_date, dto.end_date);

    const existing = await this.academicYearRepository.findOne({
      where: { label: dto.label },
    });
    if (existing) {
      throw new ConflictException(
        'Academic year with this label already exists',
      );
    }

    const academicYear = this.academicYearRepository.create(dto);

    try {
      const saved = await this.academicYearRepository.save(academicYear);
      return {
        message: 'Academic year created successfully',
        data: {
          id: saved.id,
          label: saved.label,
        },
      };
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Academic year with this label already exists',
        );
      }
      throw error;
    }
  }

  async updateAcademicYear(id: number, dto: UpdateAcademicYearDto) {
    const academicYear = await this.academicYearRepository.findOne({
      where: { id },
    });

    if (!academicYear) {
      throw new NotFoundException('Academic year not found');
    }

    const start_date = dto.start_date ?? academicYear.start_date;
    const end_date = dto.end_date ?? academicYear.end_date;
    this.validateDateRange(start_date, end_date);

    if (dto.label && dto.label !== academicYear.label) {
      const existing = await this.academicYearRepository.findOne({
        where: { label: dto.label },
      });
      if (existing) {
        throw new ConflictException(
          'Academic year with this label already exists',
        );
      }
    }

    Object.assign(academicYear, dto);

    try {
      const updated = await this.academicYearRepository.save(academicYear);
      return {
        message: 'Academic year updated successfully',
        data: updated,
      };
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Academic year with this label already exists',
        );
      }
      throw error;
    }
  }

  async deleteAcademicYear(id: number) {
    const academicYear = await this.academicYearRepository.findOne({
      where: { id },
    });

    if (!academicYear) {
      throw new NotFoundException('Academic year not found');
    }

    await this.academicYearRepository.remove(academicYear);

    return {
      message: 'Academic year deleted successfully',
    };
  }

  async initializeAcademicYear(id: number) {
    const academicYear = await this.academicYearRepository.findOne({
      where: { id },
    });

    if (!academicYear) {
      throw new NotFoundException('Academic year not found');
    }
    const sourceAcademicYear = await this.academicYearRepository.findOne({
      where: { end_date: LessThan(academicYear.start_date) },
      order: { end_date: 'DESC' },
    });

    if (!sourceAcademicYear) {
      throw new NotFoundException('Source academic year not found');
    }

    const alreadyInitialized = await this.dataSource
      .getRepository(SectionSubject)
      .findOne({
        where: { academicYear: { id: academicYear.id } },
      });

    if (alreadyInitialized) {
      throw new ConflictException(
        'The target academic year has already been initialized',
      );
    }

    const previousAssignments = await this.dataSource
      .getRepository(SectionSubject)
      .find({
        where: { academicYear: { id: sourceAcademicYear.id } },
        relations: {
          section: true,
          subject: true,
          supervisor: true,
        },
      });

    if (previousAssignments.length === 0) {
      throw new ConflictException(
        'The previous academic year has not been initialized.',
      );
    }
    return await this.dataSource.transaction(async (manager) => {
      const newAssignments = previousAssignments.map((assignment) => {
        const newAssignment = manager.getRepository(SectionSubject).create({
          section: assignment.section,
          subject: assignment.subject,
          supervisor: assignment.supervisor,
          academicYear: academicYear,
        });

        return newAssignment;
      });

      // execute the insert query in chunks to avoid exceeding the parameter limit
      // await manager
      //   .getRepository(SectionSubject)
      //   .save(newAssignments, { chunk: 100 });
      await manager
        .createQueryBuilder()
        .insert()
        .into(SectionSubject)
        .values(
          previousAssignments.map((assignment) => ({
            section: { id: assignment.section.id },
            subject: { id: assignment.subject.id },
            supervisor: { id: assignment.supervisor.id },
            academicYear: { id: academicYear.id },
          })),
        )
        .execute();

      return {
        message: 'Academic year initialized successfully',
        copiedAssignments: newAssignments.length,
        academicYearId: academicYear.id,
      };
    });
  }

  private validateDateRange(
    start_date: string | Date,
    end_date: string | Date,
  ) {
    if (new Date(end_date).getTime() <= new Date(start_date).getTime()) {
      throw new BadRequestException('end_date must be after start_date');
    }
  }
}
