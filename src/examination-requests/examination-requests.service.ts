import {
  BadRequestException,
  ForbiddenException,
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
import { CoordinatorAvailabilityService } from '../examination-appointments/coordinator-availability.service';
import { ExaminationAppointmentsService } from 'src/examination-appointments/examination-appointments.service';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import {
  GetAllExaminationRequestsResponseDto,
  GetExaminationRequestResponseDto,
} from './dto/examination-request-response.dto';
import { UserRole } from 'src/constants/user-roles';

@Injectable()
export class ExaminationRequestsService {
  constructor(
    @InjectRepository(ExaminationRequest)
    private readonly examinationRepository: Repository<ExaminationRequest>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    private readonly CoordinatorAvailabilityService: CoordinatorAvailabilityService,
    private readonly appointmentService: ExaminationAppointmentsService,
    private readonly cloudinaryService: CloudinaryService,
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

        const slot =
          await this.CoordinatorAvailabilityService.validateSlotAvailability(
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
          const uploadedImages = await this.cloudinaryService.uploadMany(
            files,
            'examination-requests',
          );
          const attachments = uploadedImages.map((image, index) =>
            manager.create(ExaminationRequestAttachments, {
              request_id: request.id,
              examination_request: request,
              fileUrl: image.secure_url,
              publicId: image.public_id,
              fileName: files[index].originalname,
              mimeType: files[index].mimetype,
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
      where: { id },
      relations: {
        patient: {
          user: true,
        },
        teeth: true,
        attachments: true,
        appointment: true,
      },
    });

    if (!examinationRequest) {
      throw new NotFoundException('Examination request not found');
    }

    // Patient can only view their own request
    if (
      user.role === UserRole.PATIENT &&
      examinationRequest.patient.user!.id !== user.userId
    ) {
      throw new ForbiddenException(
        'You are not allowed to view this examination request.',
      );
    }

    return {
      id: examinationRequest.id,
      patient_id: examinationRequest.patient_id,
      symptoms: examinationRequest.symptoms,
      chief_complaint: examinationRequest.chief_complaint,
      status: examinationRequest.status,
      submitted_at: examinationRequest.submitted_at,
      teeth: examinationRequest.teeth.map((tooth) => ({
        id: tooth.id,
        tooth: tooth.tooth,
      })),
      attachments: examinationRequest.attachments.map((attachment) => ({
        id: attachment.id,
        file_url: attachment.fileUrl,
        file_name: attachment.fileName,
      })),
      appointment: examinationRequest.appointment
        ? {
            id: examinationRequest.appointment.id,
            appointmentDate: examinationRequest.appointment.appointment_date,
          }
        : null,
    };
  }

  async getAllExaminationRequestsForAUser(user: AuthenticatedUser) {
    const examinationRequest = await this.examinationRepository.find({
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
    const examinationRequests = await this.examinationRepository.find({
      relations: {
        patient: true,
        initialExamination: true,
        teeth: true,
        attachments: true,
        appointment: true,
      },
    });
    return examinationRequests.map((request) => ({
      id: request.id,
      patient_id: request.patient_id,
      patient_name: request.patient.full_name,
      symptoms: request.symptoms,
      chief_complaint: request.chief_complaint,
      status: request.status,
      submitted_at: request.submitted_at,
      teeth: request.teeth.map((tooth) => ({
        id: tooth.id,
        tooth: tooth.tooth,
      })),
      attachments: request.attachments.map((attachment) => ({
        id: attachment.id,
        fileUrl: attachment.fileUrl,
        fileName: attachment.fileName,
      })),
      appointment: request.appointment
        ? {
            id: request.appointment.id,
            appointmentDate: request.appointment.appointment_date,
          }
        : null,
    }));
  }
}
