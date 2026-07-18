import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubjectProcedures } from './subject-procedures.entity';
import { Subject } from 'src/subjects/subjects.entity';
import { CreateSubjectProcedureDto } from './dto/create-subject-procedure.dto';
import { UpdateSubjectProcedureDto } from './dto/update-subject-procedure.dto';
import { GetSubjectProceduresQueryDto } from './dto/get-subject-procedures-query.dto';

@Injectable()
export class SubjectProceduresService {
  constructor(
    @InjectRepository(SubjectProcedures)
    private readonly subjectProcedureRepository: Repository<SubjectProcedures>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}

  async getSubjectProcedures(dto: GetSubjectProceduresQueryDto) {
    const qb =
      this.subjectProcedureRepository.createQueryBuilder('subjectProcedure');

    if (dto.subject_id !== undefined) {
      qb.andWhere('subjectProcedure.subject_id = :subjectId', {
        subjectId: dto.subject_id,
      });
    }

    if (dto.search) {
      qb.andWhere('subjectProcedure.name ILIKE :search', {
        search: `%${dto.search}%`,
      });
    }

    if (dto.is_active !== undefined) {
      qb.andWhere('subjectProcedure.is_active = :is_active', {
        is_active: dto.is_active,
      });
    }

    qb.orderBy('subjectProcedure.createdAt', 'DESC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit);

    const [subjectProcedures, total] = await qb.getManyAndCount();

    return {
      message: 'Subject procedures retrieved successfully',
      data: subjectProcedures,
      meta: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages: Math.ceil(total / dto.limit),
      },
    };
  }

  async getSubjectProcedureById(id: number) {
    const subjectProcedure = await this.subjectProcedureRepository.findOne({
      where: { id },
    });

    if (!subjectProcedure) {
      throw new NotFoundException('Subject procedure not found');
    }

    return {
      message: 'Subject procedure retrieved successfully',
      data: subjectProcedure,
    };
  }

  async createSubjectProcedure(dto: CreateSubjectProcedureDto) {
    const subject = await this.subjectRepository.findOne({
      where: { id: dto.subject_id },
    });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    const existing = await this.subjectProcedureRepository.findOne({
      where: { subject: { id: dto.subject_id }, name: dto.name },
    });
    if (existing) {
      throw new ConflictException(
        'A procedure with this name already exists for this subject',
      );
    }

    const subjectProcedure = this.subjectProcedureRepository.create({
      name: dto.name,
      description: dto.description,
      required_count: dto.required_count,
      is_active: dto.is_active,
      subject,
    });

    try {
      const saved =
        await this.subjectProcedureRepository.save(subjectProcedure);
      return {
        message: 'Subject procedure created successfully',
        data: saved,
      };
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(
          'A procedure with this name already exists for this subject',
        );
      }
      throw error;
    }
  }

  async updateSubjectProcedure(id: number, dto: UpdateSubjectProcedureDto) {
    const subjectProcedure = await this.subjectProcedureRepository.findOne({
      where: { id },
    });

    if (!subjectProcedure) {
      throw new NotFoundException('Subject procedure not found');
    }

    if (dto.subject_id !== undefined) {
      const subject = await this.subjectRepository.findOne({
        where: { id: dto.subject_id },
      });
      if (!subject) {
        throw new NotFoundException('Subject not found');
      }
      subjectProcedure.subject = subject;
    }

    const targetSubjectId = dto.subject_id ?? subjectProcedure.subject_id;
    const targetName = dto.name ?? subjectProcedure.name;

    if (
      (dto.name !== undefined || dto.subject_id !== undefined) &&
      (targetName !== subjectProcedure.name ||
        targetSubjectId !== subjectProcedure.subject_id)
    ) {
      const existing = await this.subjectProcedureRepository.findOne({
        where: { subject: { id: targetSubjectId }, name: targetName },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          'A procedure with this name already exists for this subject',
        );
      }
    }

    if (dto.name !== undefined) {
      subjectProcedure.name = dto.name;
    }
    if (dto.description !== undefined) {
      subjectProcedure.description = dto.description;
    }
    if (dto.required_count !== undefined) {
      subjectProcedure.required_count = dto.required_count;
    }
    if (dto.is_active !== undefined) {
      subjectProcedure.is_active = dto.is_active;
    }

    try {
      const updated =
        await this.subjectProcedureRepository.save(subjectProcedure);
      return {
        message: 'Subject procedure updated successfully',
        data: updated,
      };
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(
          'A procedure with this name already exists for this subject',
        );
      }
      throw error;
    }
  }

  async deleteSubjectProcedure(id: number) {
    const subjectProcedure = await this.subjectProcedureRepository.findOne({
      where: { id },
    });

    if (!subjectProcedure) {
      throw new NotFoundException('Subject procedure not found');
    }

    await this.subjectProcedureRepository.remove(subjectProcedure);

    return {
      message: 'Subject procedure deleted successfully',
    };
  }
}
