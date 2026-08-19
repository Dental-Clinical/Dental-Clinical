import { EntityManager } from 'typeorm';
import { Coordinator } from 'src/coordinators/coordinator.entity';
import { ExaminationAppointment } from 'src/examination-appointments/examination-appointment.entity';
import { ExaminationRequest } from 'src/examination-requests/entities/examination-request.entity';
import { ExaminationRequestAttachments } from 'src/examination-requests/entities/examination-request-attachment.entity';
import { ExaminationRequestTeeth } from 'src/examination-requests/entities/examination-request-teeth.entity';
import { ExaminationRequestStatus } from 'src/examination-requests/Enums/examination-request.enum';
import { InitialExamination } from 'src/initial-examination/initial-examination.entity';
import { Patient } from 'src/patients/patient.entity';
import { Subject } from 'src/subjects/subjects.entity';
import { SeedContext } from '../seed-context';
import { backdate, insert } from '../support/persistence.helper';
import { addMinutes } from '../support/clock.helper';
import { assertValidTeeth } from '../support/teeth.helper';
import {
  ExaminationVisitBlueprint,
  InitialExaminationBlueprint,
  RequestBlueprint,
} from '../data/case-blueprint';

/**
 * The intake half of the workflow: the patient's request, its attachments and
 * flagged teeth, the booked examination slot, and the coordinator's initial
 * examination.
 *
 * This seeder is a *builder*, not a pipeline step — it is driven by the case
 * seeder for scenarios and by the pending-request seeder for the coordinator's
 * queue, so both paths produce byte-identical intake records.
 */
export class ExaminationSeeder {
  readonly name = 'examinations';

  async seedRequest(
    context: SeedContext,
    manager: EntityManager,
    params: {
      scenarioKey: string;
      patient: Patient;
      blueprint: RequestBlueprint;
      status: ExaminationRequestStatus;
    },
  ): Promise<ExaminationRequest> {
    const { blueprint, patient, scenarioKey } = params;
    assertValidTeeth(blueprint.teeth, `request "${scenarioKey}"`);

    const request = await insert(manager, ExaminationRequest, {
      patient,
      patient_id: patient.id,
      chief_complaint: blueprint.chiefComplaint,
      symptoms: blueprint.symptoms,
      status: params.status,
    });

    // submitted_at is a CreateDateColumn, so the real submission date has to be
    // written back after the insert — see backdate().
    await backdate(manager, ExaminationRequest, request.id, {
      submitted_at: context.clock.day(blueprint.submittedDayOffset),
    });

    for (const tooth of blueprint.teeth) {
      await insert(manager, ExaminationRequestTeeth, {
        examination_request: request,
        request_id: request.id,
        tooth,
      });
    }

    for (const attachment of blueprint.attachments) {
      const asset = context.media.build(
        'request-attachment',
        scenarioKey,
        attachment,
      );
      await insert(manager, ExaminationRequestAttachments, {
        examination_request: request,
        request_id: request.id,
        fileUrl: asset.fileUrl,
        publicId: asset.publicId,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
      });
    }

    context.logger.created('examination request', blueprint.chiefComplaint);
    return request;
  }

  async seedVisit(
    context: SeedContext,
    manager: EntityManager,
    params: {
      request: ExaminationRequest;
      coordinator: Coordinator;
      blueprint: ExaminationVisitBlueprint;
    },
  ): Promise<ExaminationAppointment> {
    const { blueprint, coordinator, request } = params;
    const date = context.clock.clinicDay(blueprint.dayOffset);

    const appointment = await insert(manager, ExaminationAppointment, {
      examination_request: request,
      request_id: request.id,
      coordinator,
      coordinator_id: coordinator.id,
      status: blueprint.status,
      appointment_date: context.clock.dateOnly(date),
      appointment_start: blueprint.start,
      appointment_end: addMinutes(blueprint.start, blueprint.durationMinutes),
    });

    context.logger.created(
      'examination appointment',
      `${context.clock.dateOnly(date)} ${blueprint.start} (${blueprint.status})`,
    );
    return appointment;
  }

  async seedInitialExamination(
    context: SeedContext,
    manager: EntityManager,
    params: {
      request: ExaminationRequest;
      appointment: ExaminationAppointment;
      coordinator: Coordinator;
      blueprint: InitialExaminationBlueprint;
      visit: ExaminationVisitBlueprint;
    },
  ): Promise<InitialExamination> {
    const { blueprint, visit } = params;
    const examinedAt = context.clock.at(
      context.clock.clinicDay(visit.dayOffset),
      visit.start,
    );

    const examination = await insert(manager, InitialExamination, {
      patient: params.request.patient,
      request: params.request,
      appointment: params.appointment,
      coordinator: params.coordinator,
      diagnosis: blueprint.diagnosis,
      clinicalFindings: blueprint.clinicalFindings,
      status: blueprint.status,
      examined_at: examinedAt,
    });

    await backdate(manager, InitialExamination, examination.id, {
      created_at: examinedAt,
    });

    context.logger.created('initial examination', blueprint.diagnosis);
    return examination;
  }
}
