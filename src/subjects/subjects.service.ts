import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from './subjects.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>, // Assuming you have a Subject entity
  ) {}
  async getSubjectProcedures(id: number) {
    const subject = await this.subjectRepository.findOne({
      where: { id },
      relations: {
        subjectProcedures: true,
      },
    });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    return {
      subjectId: subject.id,
      subjectName: subject.name,
      procedures: subject.subjectProcedures.map((procedure) => ({
        procedureId: procedure.id,
        procedureName: procedure.name,
        description: procedure.description,
      })),
    };
  }
}
