import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { StudentSubjectEnrollment } from './student-subject-enrollment.entity';
import { EnrollStudentInSubjectsDto } from './dto/enroll-student-in-subjects.dto';
import { Student } from 'src/students/student.entity';
import { Section } from 'src/section/section.entity';
import { Subject } from 'src/subjects/subjects.entity';
import { AcademicYear } from 'src/academic-years/academic-years.entity';
import { StudentAcademicYear } from 'src/student-academic-years/student-academic-years.entity';
import { SectionSubject } from 'src/section-subject/section-subject.entity';
import { ChangeStudentSectionDto } from './dto/change-student-section.dto';
import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';

@Injectable()
export class StudentSubjectEnrollmentService {
  constructor(
    @InjectRepository(StudentSubjectEnrollment)
    private readonly enrollmentRepository: Repository<StudentSubjectEnrollment>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,
    @InjectRepository(StudentAcademicYear)
    private readonly studentAcademicYearRepository: Repository<StudentAcademicYear>,
    @InjectRepository(SectionSubject)
    private readonly sectionSubjectRepository: Repository<SectionSubject>,
    @InjectRepository(ClinicalCase)
    private readonly clinicalCaseRepository: Repository<ClinicalCase>,
    private readonly dataSource: DataSource,
  ) {}
  async enrollStudentInSubjects(dto: EnrollStudentInSubjectsDto) {
    const student = await this.resolveStudent(dto.student_id);
    const academicYear = await this.resolveAcademicYear(dto.academic_year_id);
    // const section = await this.resolveSection(dto.section_id);
    // const subject = await this.resolveSubject(dto.subject_id);
    const studentAcademicYear =
      await this.studentAcademicYearRepository.findOne({
        where: {
          student: { id: student.id },
          academicYear: { id: academicYear.id },
        },
      });

    if (!studentAcademicYear) {
      throw new ConflictException(
        'Student is not enrolled in the specified academic year.',
      );
    }
    const duplicateSubjects = new Set<number>();

    for (const enrollment of dto.enrollments) {
      if (duplicateSubjects.has(enrollment.subject_id)) {
        throw new BadRequestException(
          `Subject ${enrollment.subject_id} is included more than once.`,
        );
      }

      duplicateSubjects.add(enrollment.subject_id);
    }

    return await this.dataSource.transaction(async (manager) => {
      const enrollments: StudentSubjectEnrollment[] = [];
      for (const item of dto.enrollments) {
        const section = await this.resolveSection(item.section_id, manager);
        const subject = await this.resolveSubject(item.subject_id, manager);

        // validate clinic
        if (section.clinic_id !== subject.clinic.id) {
          throw new ConflictException(
            'The selected section does not belong to the same clinic as the subject.',
          );
        }

        // validate study year
        if (studentAcademicYear.study_year_id !== subject.study_year_id) {
          throw new ConflictException(
            'The subject does not belong to the student current study year.',
          );
        }

        // validate teaching assignment
        const assignment = await manager.getRepository(SectionSubject).findOne({
          where: {
            section: { id: section.id },
            subject: { id: subject.id },
            academicYear: { id: academicYear.id },
          },
        });
        if (!assignment) {
          throw new ConflictException(
            `No teaching assignment exists for ${subject.name} in ${section.name}.`,
          );
        }

        // validate existing enrollment
        const existingEnrollment = await manager
          .getRepository(StudentSubjectEnrollment)
          .findOne({
            where: {
              student: { id: student.id },
              subject: { id: subject.id },
              academicYear: { id: academicYear.id },
            },
          });

        if (existingEnrollment) {
          throw new ConflictException(
            'The student is already enrolled in this subject for the specified section and academic year.',
          );
        }

        enrollments.push(
          manager.getRepository(StudentSubjectEnrollment).create({
            student,
            section,
            subject,
            academicYear: { id: dto.academic_year_id },
          }),
        );
        await manager.save(enrollments, { chunk: 100 });
        return {
          message: 'Student enrolled successfully.',
          enrolledSubjects: enrollments.length,
        };
      }
    });
  }
  async getAllEnrollments() {
    const enrollments = await this.enrollmentRepository.find({
      where: {
        academicYear: { is_active: true },
        subject: { is_active: true },
      },
      relations: {
        student: { user: true },
        subject: { studyYear: true },
        section: {
          sectionSubjects: {
            subject: true,
            supervisor: { user: true },
          },
        },
        academicYear: true,
      },
    });

    if (!enrollments || enrollments.length === 0) {
      throw new NotFoundException('No subjects found for this student');
    }

    const sectionSubjects = await this.sectionSubjectRepository.find({
      where: {
        academicYear: {
          id: enrollments[0].academicYear.id,
        },
      },
      relations: {
        section: true,
        subject: true,
        supervisor: { user: true },
      },
    });
    const lookup = new Map(
      sectionSubjects.map((ss) => [`${ss.section.id}-${ss.subject.id}`, ss]),
    );
    const result = enrollments.map((enrollment) => {
      const assignment = lookup.get(
        `${enrollment.section.id}-${enrollment.subject.id}`,
      );

      return {
        id: enrollment.id,
        student: {
          id: enrollment.student.id,
          fullName: enrollment.student.user.full_name,
        },
        academicYear: enrollment.academicYear.label,
        studyYear: enrollment.subject.studyYear.name,
        subject: {
          id: enrollment.subject.id,
          name: enrollment.subject.name,
        },
        section: enrollment.section.name,
        supervisor: assignment?.supervisor.user.full_name ?? null,
      };
    });
    return {
      message: 'Enrollments retrieved successfully',
      enrollments: result,
      total: result.length,
    };
  }
  async getEnrollmentById(id: number) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations: {
        student: { user: true },
        subject: { studyYear: true },
        section: true,
        academicYear: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    const assignment = await this.sectionSubjectRepository.findOne({
      where: {
        section: { id: enrollment.section.id },
        subject: { id: enrollment.subject.id },
        academicYear: { id: enrollment.academicYear.id },
      },
      relations: {
        supervisor: { user: true },
      },
    });

    return {
      message: 'Enrollment retrieved successfully',
      enrollment: {
        id: enrollment.id,
        student: {
          id: enrollment.student.id,
          fullName: enrollment.student.user.full_name,
        },
        academicYear: enrollment.academicYear.label,
        studyYear: enrollment.subject.studyYear.name,
        subject: {
          id: enrollment.subject.id,
          name: enrollment.subject.name,
        },
        section: enrollment.section.name,
        supervisor: assignment?.supervisor.user.full_name ?? null,
      },
    };
  }
  async changeStudentSection(id: number, dto: ChangeStudentSectionDto) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations: {
        student: { user: true },
        subject: { studyYear: true },
        section: true,
        academicYear: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (dto.section_id !== undefined) {
      const newSection = await this.resolveSection(dto.section_id);
      if (newSection.clinic_id !== enrollment.subject.clinic.id) {
        throw new ConflictException(
          'The new section does not belong to the same clinic as the subject.',
        );
      }
      const teachingAssignment = await this.sectionSubjectRepository.findOne({
        where: {
          section: { id: newSection.id },
          subject: { id: enrollment.subject.id },
          academicYear: { id: enrollment.academicYear.id },
        },
      });

      if (!teachingAssignment) {
        throw new ConflictException(
          'No teaching assignment exists for the selected section and subject.',
        );
      }
      const hasCases = await this.clinicalCaseRepository.exists({
        where: {
          assignedStudent: {
            id: enrollment.student.id,
          },
          subject: {
            id: enrollment.subject.id,
          },
        },
      });

      if (hasCases) {
        throw new ConflictException(
          'The student already has clinical activity for this subject.',
        );
      }
      if (dto.section_id === enrollment.section.id) {
        throw new BadRequestException(
          'The student is already assigned to this section.',
        );
      }
      enrollment.section = newSection;
    }

    await this.enrollmentRepository.save(enrollment);

    return {
      message: 'Enrollment updated successfully',
      id: enrollment.id,
      student: enrollment.student.user.full_name,
      subject: enrollment.subject.name,
      section: enrollment.section.name,
    };
  }
  private async resolveStudent(studentId: number) {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: { user: true },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return student;
  }
  private async resolveSection(sectionId: number, manager?: EntityManager) {
    const section = await (
      manager ? manager.getRepository(Section) : this.sectionRepository
    ).findOne({
      where: { id: sectionId },
    });
    if (!section) {
      throw new NotFoundException('Section not found');
    }
    return section;
  }
  private async resolveSubject(subjectId: number, manager?: EntityManager) {
    const subject = await (
      manager ? manager.getRepository(Subject) : this.subjectRepository
    ).findOne({
      where: { id: subjectId },
      relations: { clinic: true },
    });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    return subject;
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
}
