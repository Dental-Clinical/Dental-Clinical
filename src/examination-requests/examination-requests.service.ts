import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExaminationRequest } from './entities/examination-request.entity';
import { Repository, DataSource } from 'typeorm';
import { CreateExaminationRequestDto } from './dto/create-request.dto';
import { Patient } from 'src/patients/patient.entity';
import { ExaminationRequestsStatus } from './Enums/examination-request.enum';
import { ExaminationRequestTeeth } from './entities/examination-request-teeth.entity';
import { ExaminationRequestAttachments } from './entities/examination-request-attachment.entity';
import { User } from 'src/users/user.entity';
import { unlink } from 'fs/promises';
import { ExaminationAppointment } from './entities/examination-request-appointment.entity';
import { ApproveExaminationAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class ExaminationRequestsService {
  constructor(
    @InjectRepository(ExaminationRequest) private readonly examinationRepository: Repository<ExaminationRequest>,
    @InjectRepository(Patient) private readonly patientRepository: Repository<Patient>,
    @InjectRepository(ExaminationAppointment) private readonly examinationAppointmentRepository: Repository<ExaminationAppointment>,
    private readonly dataSource: DataSource,
  ) { }

  async createExaminationRequest(
    dto: CreateExaminationRequestDto,
    user: User,
    files: Express.Multer.File[],
  ) {
    const patient = await this.patientRepository.findOne({
      where: { user: { id: user.id } },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    try {
      return await this.dataSource.transaction(async (manager) => {
        const prevRequest = await manager.findOne(ExaminationRequest, {
          where: { patientId: patient.id, status: ExaminationRequestsStatus.PENDING },
        });
        if (prevRequest) {
          throw new BadRequestException('You already have an examination request');
        }

        const request = manager.create(ExaminationRequest, {
          patientId: patient.id,
          symptoms: dto.symptoms,
          status: ExaminationRequestsStatus.PENDING,
          created_by_student: undefined,
          appointment_datetime: dto.appointment
        });
        await manager.save(request);

        const teeth = dto.teeth.map((number) =>
          manager.create(ExaminationRequestTeeth, {
            request_id: request.id,
            tooth: number,
          }),
        );
        await manager.save(teeth);

        if (files?.length) {
          const attachments = files.map((file) =>
            manager.create(ExaminationRequestAttachments, {
              request_id: request.id,
              examination_request: request,
              file_path: file.path,
              file_name: file.originalname,
              mime_type: file.mimetype,
            }),
          );
          await manager.save(attachments);
        }

        return request;
      });
    } catch (err) {
      await Promise.all((files ?? []).map((f) => unlink(f.path).catch(() => { })));
      throw err;
    }
  }

  async getExaminationRequest(id: number, user: User) {
    const examinationRequest = await this.examinationRepository.findOne({
      where: {
        id,
        patient: {
          user: {
            id: user.id,
          },
        },
      },
      relations: {
        patient: true,
        attachments: true,
      },
    });

    if (!examinationRequest) {
      throw new NotFoundException('Examination request not found');
    }

    return examinationRequest;
  }

  async approveExaminationRequestAppointment(id: number, user: User, dto: ApproveExaminationAppointmentDto) {
    const examinationRequest = await this.examinationRepository.findOne({ where: { id: id } })
    if (!examinationRequest) {
      throw new NotFoundException("Examination request not found")
    }

    const appointment = examinationRequest?.appointment_datetime
    const result = this.examinationAppointmentRepository.create({
      request_id: examinationRequest?.id,
      coordinator_id: user.id,
      appointment_datetime: appointment,
      status: dto.status
    })
    await this.examinationAppointmentRepository.save(result)
    return result


  }

  async getAllExaminationRequests(user: User) {
    const examinationRequest = await this.examinationRepository.findOne({
      where: {
        patient: {
          user: {
            id: user.id,
          },
        },
      },
      relations: {
        patient: true,
        attachments: true,
      },
    });

    return examinationRequest

  }
}
