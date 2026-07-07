import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExaminationRequest } from './entities/examination-request.entity';
import { Repository, DataSource } from 'typeorm';
import { CreateExaminationRequestDto } from './dto/create-request.dto';
import { Patient } from 'src/patients/patient.entity';
import { ExaminationRequestStatus } from './Enums/examination-request.enum';
import { ExaminationRequestTeeth } from './entities/examination-request-teeth.entity';
import { ExaminationRequestAttachments } from './entities/examination-request-attachment.entity';
import { unlink } from 'fs/promises';
import { AvailabilityService } from '../examination-appointments/availability.service';
import { ExaminationAppointmentsService } from 'src/examination-appointments/examination-appointments.service';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@Injectable()
export class ExaminationRequestsService {
  constructor(
    @InjectRepository(ExaminationRequest)
    private readonly examinationRepository: Repository<ExaminationRequest>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    private readonly availablityService: AvailabilityService,
    private readonly appointmentService: ExaminationAppointmentsService,
    private readonly dataSource: DataSource,
  ) {}

  async createExaminationRequest(
    dto: CreateExaminationRequestDto,
    user: AuthenticatedUser,
    files: Express.Multer.File[],
  ) {
    const patient = await this.patientRepository.findOne({
      where: {
        user: {
          id: user.userId,
        },
      },
    });

    if (!patient) throw new NotFoundException('Patient not found');

    const uniqueTeeth = new Set(dto.teeth);

    if (uniqueTeeth.size !== dto.teeth.length) {
      throw new BadRequestException('Duplicate tooth numbers are not allowed.');
    }
    try {
      return await this.dataSource.transaction(async (manager) => {
        const prevRequest = await manager.findOne(ExaminationRequest, {
          where: {
            patient_id: patient.id,
            status: ExaminationRequestStatus.PENDING,
          },
        });
        if (prevRequest) {
          throw new BadRequestException(
            'You already have an examination request',
          );
        }

        const slot = await this.availablityService.validateSlotAvailability(
          dto.appointmentDate,
          dto.appointmentStart,
          dto.coordinatorId,
          manager,
        );

        const request = manager.create(ExaminationRequest, {
          patient_id: patient.id,
          symptoms: dto.symptoms,
          status: ExaminationRequestStatus.PENDING,
          chief_complaint: dto.chiefComplaints,
        });
        await manager.save(request);

        const appointment = await this.appointmentService.createAppointment(
          request,
          { id: dto.coordinatorId } as any,
          {
            appointmentDate: dto.appointmentDate,
            appointmentStart: dto.appointmentStart,
            appointmentEnd: slot.endTime,
          },
          manager,
        );

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

        return {
          message: 'Examination request created successfully',

          request,
        };
      });
    } catch (err) {
      await Promise.all(
        (files ?? []).map((f) => unlink(f.path).catch(() => {})),
      );
      throw err;
    }
  }

  async getExaminationRequest(id: number, user: AuthenticatedUser) {
    const examinationRequest = await this.examinationRepository.findOne({
      where: {
        id,
        patient: {
          user: {
            id: user.userId,
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

  async getAllExaminationRequestsForAUser(user: AuthenticatedUser) {
    const examinationRequest = await this.examinationRepository.findOne({
      where: {
        patient: {
          user: {
            id: user.userId,
          },
        },
      },
      relations: {
        patient: true,
        attachments: true,
        appointment: true,
        teeth: true,
      },
    });

    return examinationRequest;
  }

  async getAllExaminationRequests() {
    return await this.examinationRepository.find();
  }
}
