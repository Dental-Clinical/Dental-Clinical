import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { SectionSubject } from './section-subject.entity';
import { CreateSectionSubjectDto } from './dto/create-section-subject.dto';
import { Section } from 'src/section/section.entity';
import { Subject } from 'src/subjects/subjects.entity';
import { Supervisor } from 'src/supervisors/supervisor.entity';
import { AcademicYear } from 'src/academic-years/academic-years.entity';
import { UpdateSectionSubjectDto } from './dto/update-section-subject.dto';

@Injectable()
export class SectionSubjectService {
  constructor(
    @InjectRepository(SectionSubject)
    private readonly sectionSubjectRepository: Repository<SectionSubject>,
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(Supervisor)
    private readonly supervisorRepository: Repository<Supervisor>,
    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,
  ) {}
  async getSectionSubjects() {
    const assignments = await this.sectionSubjectRepository.find({
      relations: {
        section: { clinic: true },
        subject: true,
        supervisor: { user: true },
        academicYear: true,
      },
    });

    return assignments.map((assignment) => ({
      id: assignment.id,

      academicYear: {
        id: assignment.academicYear.id,
        label: assignment.academicYear.label,
      },

      clinic: {
        id: assignment.section.clinic.id,
        name: assignment.section.clinic.name,
      },

      section: {
        id: assignment.section.id,
        name: assignment.section.name,
      },

      subject: {
        id: assignment.subject.id,
        name: assignment.subject.name,
      },

      supervisor: {
        id: assignment.supervisor.id,
        fullName: assignment.supervisor.user.full_name,
      },
    }));
  }
  async createSectionSubject(dto: CreateSectionSubjectDto) {
    const section = await this.resolveSection(dto.section_id);
    const subject = await this.resolveSubject(dto.subject_id);
    const supervisor = await this.resolveSupervisor(dto.supervisor_id);
    const academicYear = await this.resolveAcademicYear(dto.academic_year_id);

    const existingAssignment = await this.sectionSubjectRepository.findOne({
      where: {
        section: { id: section.id },
        subject: { id: subject.id },
        academicYear: { id: academicYear.id },
      },
    });

    if (existingAssignment) {
      throw new ConflictException(
        'A teaching assignment already exists for this section, subject and academic year.',
      );
    }
    if (section.clinic_id !== subject.clinic.id) {
      throw new ConflictException(
        'The section and subject do not belong to the same clinic.',
      );
    }

    const sectionSubject = this.sectionSubjectRepository.create({
      academicYear,
      section,
      subject,
      supervisor,
    });

    await this.sectionSubjectRepository.save(sectionSubject);
    return {
      message: 'Teaching assignment created successfully.',
      data: {
        id: sectionSubject.id,
        section: section.name,
        subject: subject.name,
        supervisor: supervisor.user.full_name,
        academicYear: academicYear.label,
      },
    };
  }

  async updateSectionSubject(id: number, dto: UpdateSectionSubjectDto) {
    const sectionSubject = await this.sectionSubjectRepository.findOne({
      where: { id },
      relations: {
        section: true,
        subject: true,
        supervisor: true,
      },
    });
    if (!sectionSubject) {
      throw new NotFoundException('Teaching assignment not found');
    }

    const section =
      dto.section_id !== undefined
        ? await this.resolveSection(dto.section_id)
        : sectionSubject.section;
    const subject =
      dto.subject_id !== undefined
        ? await this.resolveSubject(dto.subject_id)
        : sectionSubject.subject;
    const supervisor =
      dto.supervisor_id !== undefined
        ? await this.resolveSupervisor(dto.supervisor_id)
        : sectionSubject.supervisor;

    if (section.clinic_id !== subject.clinic.id) {
      throw new ConflictException(
        'The section and subject do not belong to the same clinic.',
      );
    }

    const existingAssignment = await this.sectionSubjectRepository.findOne({
      where: {
        id: Not(id),
        section: { id: section.id },
        subject: { id: subject.id },
        academicYear: { id: sectionSubject.academicYear.id },
      },
    });

    if (existingAssignment) {
      throw new ConflictException(
        'A teaching assignment already exists for this section, subject and academic year.',
      );
    }

    sectionSubject.section = section;
    sectionSubject.subject = subject;
    sectionSubject.supervisor = supervisor;

    await this.sectionSubjectRepository.save(sectionSubject);
    return {
      message: 'Teaching assignment updated successfully.',
      data: {
        id: sectionSubject.id,
        section: section.name,
        subject: subject.name,
        supervisor: supervisor.user.full_name,
      },
    };
  }
  async resolveSection(sectionId: number) {
    const section = await this.sectionRepository.findOne({
      where: { id: sectionId },
      relations: {
        clinic: true,
      },
    });
    if (!section) {
      throw new NotFoundException('Section not found');
    }
    return section;
  }
  async resolveSubject(subjectId: number) {
    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId },
      relations: {
        clinic: true,
      },
    });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    return subject;
  }
  async resolveSupervisor(supervisorId: number) {
    const supervisor = await this.supervisorRepository.findOne({
      where: { id: supervisorId },
      relations: {
        user: true,
      },
    });
    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }
    return supervisor;
  }
  async resolveAcademicYear(academicYearId: number) {
    const academicYear = await this.academicYearRepository.findOne({
      where: { id: academicYearId },
    });
    if (!academicYear) {
      throw new NotFoundException('Academic year not found');
    }
    return academicYear;
  }
}
