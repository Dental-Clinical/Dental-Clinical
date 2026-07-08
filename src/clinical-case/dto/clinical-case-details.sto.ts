import { ClinicalCaseStatus } from '../enums/clinical-case-status.enum';

export class ClinicalCaseDetailsDto {
  // id: number
  //   status: ClinicalCaseStatus
  //   createdAt: Date

  //   patient: {
  //     id: clinicalCase.patient.id,
  //     fullName: clinicalCase.patient.full_name,
  //     phone: clinicalCase.patient.phone,
  //     medicalHistory: clinicalCase.patient.medical_history,
  //     allergies: clinicalCase.patient.allergies,
  //     currentMedications: clinicalCase.patient.current_medications,
  //   },

  //   request: {
  //     id: clinicalCase.request.id,
  //     chiefComplaint: clinicalCase.request.chief_complaint,
  //     symptoms: clinicalCase.request.symptoms,
  //   },

  //   subject: {
  //     id: clinicalCase.subject.id,
  //     name: clinicalCase.subject.name,
  //   },

  //   assignedStudent: clinicalCase.assignedStudent
  //     ? {
  //         id: clinicalCase.assignedStudent.id,
  //         name: clinicalCase.assignedStudent.user.full_name,
  //       }
  //     : null,
  // };
  id: number;
  status: ClinicalCaseStatus;
  createdAt: Date;

  patient: {
    id: number;
    fullName: string;
    phone: string;
    medicalHistory: string;
    allergies: string;
    currentMedications: string;
  };

  request: {
    id: number;
    chiefComplaint: string;
    symptoms: string;
  };

  subject: {
    id: number;
    name: string;
  };

  assignedStudent: {
    id: number;
    name: string;
  } | null;
}
