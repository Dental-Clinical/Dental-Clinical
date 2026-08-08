import { ClinicalAppointmentStatus } from 'src/clinical-appointments/enums/clinical-appointment.enum';
import { ClinicalCaseStatus } from 'src/clinical-case/enums/clinical-case-status.enum';
import { ExaminationAppointmentStatus } from 'src/examination-requests/Enums/examination-appointment.enum';
import { Grade } from 'src/clinical-case-evaluation/enums/grade.enum';
import { InitialExaminationStatus } from 'src/initial-examination/enums/initial-examination-status.enum';
import { PlannedProceduresStatus } from 'src/planned-procedures/enum/planned-procedures-status.enum';
import { TreatmentSessionStatus } from 'src/treatment-sessions/enums/treatment-session-status.enum';
import { CaseBlueprint, PendingRequestBlueprint } from './case-blueprint';

/**
 * One scenario per lifecycle stage, plus the variants that only appear in real
 * clinics: a case with a no-show session, a walk-in patient, a returning
 * patient, and two finished cases so the progress and evaluation screens have
 * something to render.
 *
 * Reading order is the reading order of the workflow, top to bottom.
 */
export const CASE_SCENARIOS: CaseBlueprint[] = [
  // ───────────────────────────── OPEN ─────────────────────────────
  {
    key: 'case.open.restorative',
    title: 'Open — deep caries 16, waiting for a student',
    targetStage: ClinicalCaseStatus.OPEN,
    patientKey: 'patient.salma',
    subjectKey: 'subject.restorative',
    request: {
      chiefComplaint: 'Sharp pain in the upper right when drinking cold water',
      symptoms:
        'Pain triggered by cold drinks for about three weeks, settles within a few seconds. No spontaneous or night pain. No swelling.',
      teeth: [16],
      submittedDayOffset: -9,
      attachments: [
        {
          slug: 'patient-photo-upper-right',
          label: 'Photo taken by the patient of the upper right quadrant',
        },
      ],
    },
    examinationVisit: {
      dayOffset: -6,
      start: '09:00',
      durationMinutes: 30,
      status: ExaminationAppointmentStatus.COMPLETED,
    },
    initialExamination: {
      clinicalFindings:
        'Deep disto-occlusal cavity on 16 with softened dentine. Positive response to cold with rapid resolution, non-tender to percussion. Bitewing shows caries approaching but not involving the pulp chamber. No periapical radiolucency.',
      diagnosis:
        'Reversible pulpitis secondary to deep dentinal caries, tooth 16.',
      status: InitialExaminationStatus.COMPLETED,
    },
  },
  {
    key: 'case.open.endodontics',
    title: 'Open — necrotic 36, waiting for a student',
    targetStage: ClinicalCaseStatus.OPEN,
    patientKey: 'patient.hasan',
    subjectKey: 'subject.endodontics',
    request: {
      chiefComplaint: 'Throbbing pain in the lower left, worse at night',
      symptoms:
        'Continuous throbbing pain for five days, disturbs sleep, partially relieved by painkillers. Painful to bite on. Diabetic patient.',
      teeth: [36],
      submittedDayOffset: -7,
      attachments: [
        {
          slug: 'previous-radiograph-36',
          label: 'Radiograph brought from a private clinic',
        },
      ],
    },
    examinationVisit: {
      dayOffset: -4,
      start: '09:30',
      durationMinutes: 30,
      status: ExaminationAppointmentStatus.COMPLETED,
    },
    initialExamination: {
      clinicalFindings:
        'Tooth 36 has a large mesio-occlusal restoration, no response to cold or electric pulp testing, markedly tender to percussion. Periapical radiograph shows a 3 mm radiolucency at the mesial root apex. Diabetes noted — HbA1c 7.4%.',
      diagnosis:
        'Pulp necrosis with symptomatic apical periodontitis, tooth 36.',
      status: InitialExaminationStatus.COMPLETED,
    },
  },

  // ─────────────────────────── ASSIGNED ───────────────────────────
  {
    key: 'case.assigned.restorative',
    title: 'Assigned — first appointment booked, no diagnosis yet',
    targetStage: ClinicalCaseStatus.ASSIGNED,
    patientKey: 'patient.rana',
    subjectKey: 'subject.restorative',
    studentKey: 'student.omar',
    request: {
      chiefComplaint: 'Food gets stuck between the upper left teeth',
      symptoms:
        'Food packing after every meal for two months with tenderness of the gum between the teeth. No thermal sensitivity.',
      teeth: [24, 25],
      submittedDayOffset: -5,
      attachments: [],
    },
    examinationVisit: {
      dayOffset: -3,
      start: '10:00',
      durationMinutes: 30,
      status: ExaminationAppointmentStatus.COMPLETED,
    },
    initialExamination: {
      clinicalFindings:
        'Proximal caries on the distal of 24 and the mesial of 25 confirmed on bitewing, with loss of the proximal contact point and food impaction. Both teeth vital and non-tender.',
      diagnosis: 'Class II proximal caries, teeth 24 and 25.',
      status: InitialExaminationStatus.COMPLETED,
    },
    assignment: {
      dayOffset: 3,
      start: '10:30',
      durationMinutes: 90,
      status: ClinicalAppointmentStatus.SCHEDULED,
    },
  },

  // ─────────────────── DIAGNOSIS_PENDING_REVIEW ───────────────────
  {
    key: 'case.diagnosis-review.endodontics',
    title: 'Diagnosis submitted — waiting on the supervisor',
    targetStage: ClinicalCaseStatus.DIAGNOSIS_PENDING_REVIEW,
    patientKey: 'patient.jad',
    subjectKey: 'subject.endodontics',
    studentKey: 'student.rita',
    request: {
      chiefComplaint: 'Pain in the lower right that started after a filling',
      symptoms:
        'Lingering pain to hot drinks for ten days, lasting several minutes. Pain radiates towards the ear. Heavy smoker.',
      teeth: [45, 46],
      submittedDayOffset: -8,
      attachments: [
        {
          slug: 'referral-note',
          label: 'Referral note from the general clinic',
          mimeType: 'application/pdf',
        },
      ],
    },
    examinationVisit: {
      dayOffset: -5,
      start: '11:00',
      durationMinutes: 30,
      status: ExaminationAppointmentStatus.COMPLETED,
    },
    initialExamination: {
      clinicalFindings:
        'Tooth 46 with a deep occlusal restoration, lingering response to heat, tender to percussion. Tooth 45 responds within normal limits but has recurrent caries at the distal margin. Periapical film shows widened lamina dura on 46.',
      diagnosis:
        'Symptomatic irreversible pulpitis with symptomatic apical periodontitis, tooth 46. Recurrent caries with reversible pulpitis, tooth 45.',
      status: InitialExaminationStatus.COMPLETED,
    },
    assignment: {
      dayOffset: -2,
      start: '09:00',
      durationMinutes: 90,
      status: ClinicalAppointmentStatus.COMPLETED,
    },
    diagnosis: {
      submittedDayOffset: -2,
      images: [
        {
          slug: 'periapical-46',
          label: 'Pre-operative periapical radiograph — tooth 46',
          description:
            'Widened periodontal ligament space at the mesial root of 46.',
        },
        {
          slug: 'intraoral-preop-46',
          label: 'Intra-oral photograph — lower right quadrant',
          description:
            'Deep occlusal restoration on 46 with marginal breakdown.',
        },
        {
          slug: 'bitewing-right',
          label: 'Right bitewing radiograph',
          description: 'Recurrent caries at the distal margin of 45.',
        },
      ],
      procedures: [
        {
          procedure: 'Multi-Canal Root Canal Treatment',
          tooth: 46,
          status: PlannedProceduresStatus.PLANNED,
        },
        {
          procedure: 'Single-Canal Root Canal Treatment',
          tooth: 45,
          status: PlannedProceduresStatus.PLANNED,
        },
      ],
    },
  },

  // ──────────────────── TREATMENT_IN_PROGRESS ─────────────────────
  {
    key: 'case.treatment.restorative',
    title: 'Treatment in progress — history, an active session and one booked',
    targetStage: ClinicalCaseStatus.TREATMENT_IN_PROGRESS,
    patientKey: 'patient.mona',
    subjectKey: 'subject.restorative',
    studentKey: 'student.sami',
    request: {
      chiefComplaint: 'Several teeth need fillings, one of them is sensitive',
      symptoms:
        'Sensitivity to sweet food on the upper left for a month. Anxious patient, prefers short appointments. Latex allergy.',
      teeth: [26, 27, 37, 47],
      submittedDayOffset: -34,
      attachments: [
        {
          slug: 'panoramic-baseline',
          label: 'Panoramic radiograph taken at registration',
        },
      ],
    },
    examinationVisit: {
      dayOffset: -31,
      start: '09:00',
      durationMinutes: 30,
      status: ExaminationAppointmentStatus.COMPLETED,
    },
    initialExamination: {
      clinicalFindings:
        'Mesio-occlusal caries on 26, occlusal caries on 27 and 47, and a failing occlusal amalgam on 37 with marginal ditching. All four teeth vital and asymptomatic to percussion. Latex-free protocol required.',
      diagnosis:
        'Multiple carious lesions and one failing restoration: 26 Class II, 27 and 47 Class I, 37 replacement amalgam.',
      status: InitialExaminationStatus.COMPLETED,
    },
    assignment: {
      dayOffset: -28,
      start: '09:00',
      durationMinutes: 90,
      status: ClinicalAppointmentStatus.COMPLETED,
    },
    diagnosis: {
      submittedDayOffset: -28,
      images: [
        {
          slug: 'preop-upper-left',
          label: 'Pre-operative photograph — upper left quadrant',
          description: 'Cavitated mesial lesion on 26.',
        },
        {
          slug: 'bitewing-left-preop',
          label: 'Left bitewing radiograph',
          description:
            'Caries depth on 26 and 27 within the outer third of dentine.',
        },
      ],
      review: {
        notes:
          'Plan approved. Sequence the upper left quadrant first as agreed. Use latex-free dam and confirm anaesthesia before each preparation; keep visits under one hour for this patient.',
        dayOffset: -27,
      },
      procedures: [
        {
          procedure: 'Class II Composite Restoration',
          tooth: 26,
          status: PlannedProceduresStatus.COMPLETED,
        },
        {
          procedure: 'Class I Composite Restoration',
          tooth: 27,
          status: PlannedProceduresStatus.COMPLETED,
        },
        {
          procedure: 'Amalgam Restoration',
          tooth: 37,
          status: PlannedProceduresStatus.IN_PROGRESS,
        },
        {
          procedure: 'Class I Composite Restoration',
          tooth: 47,
          status: PlannedProceduresStatus.PLANNED,
        },
      ],
    },
    sessions: [
      {
        title: 'Class II composite restoration — tooth 26',
        status: TreatmentSessionStatus.COMPLETED,
        appointment: {
          dayOffset: -21,
          start: '09:00',
          durationMinutes: 90,
          status: ClinicalAppointmentStatus.COMPLETED,
        },
        studentNotes:
          'Infiltration anaesthesia given. Caries fully excavated, no pulp exposure. Sectional matrix and ring placed, total-etch technique, incremental composite build-up, occlusion adjusted and polished.',
        supervisorNotes:
          'Good isolation and a well-contoured proximal contact. Watch the cervical increment thickness — cure each layer separately.',
        procedures: [
          { procedure: 'Class II Composite Restoration', tooth: 26 },
        ],
        materials: [
          'material.anesthetic',
          'material.etchant',
          'material.bonding-agent',
          'material.composite-a2',
          'material.matrix-band',
          'material.cotton-rolls',
        ],
      },
      {
        title: 'Class I composite restoration — tooth 27',
        status: TreatmentSessionStatus.COMPLETED,
        appointment: {
          dayOffset: -14,
          start: '09:00',
          durationMinutes: 90,
          status: ClinicalAppointmentStatus.COMPLETED,
        },
        studentNotes:
          'Occlusal caries removed, preparation confined to the fissure system. Composite placed in two increments and finished. Patient tolerated the visit well.',
        supervisorNotes:
          'Conservative preparation and correct anatomy. Restoration accepted.',
        procedures: [{ procedure: 'Class I Composite Restoration', tooth: 27 }],
        materials: [
          'material.anesthetic',
          'material.etchant',
          'material.bonding-agent',
          'material.composite-a2',
          'material.cotton-rolls',
        ],
      },
      {
        title: 'Amalgam replacement — tooth 37, preparation stage',
        status: TreatmentSessionStatus.COMPLETED,
        appointment: {
          dayOffset: -7,
          start: '11:00',
          durationMinutes: 90,
          status: ClinicalAppointmentStatus.COMPLETED,
        },
        studentNotes:
          'Old amalgam removed and recurrent caries excavated. Preparation deeper than expected on the distal wall, so a calcium hydroxide liner was placed and the tooth temporised. Condensation deferred to the next visit.',
        supervisorNotes:
          'Correct decision to temporise rather than condense over an unlined deep floor. Reassess pulp response before the definitive restoration.',
        procedures: [{ procedure: 'Amalgam Restoration', tooth: 37 }],
        materials: [
          'material.anesthetic',
          'material.calcium-hydroxide',
          'material.cotton-rolls',
        ],
      },
      {
        title: 'Amalgam replacement — tooth 37, condensation and finishing',
        status: TreatmentSessionStatus.ACTIVE,
        appointment: {
          dayOffset: 0,
          start: '11:00',
          durationMinutes: 90,
          status: ClinicalAppointmentStatus.SCHEDULED,
        },
        studentNotes:
          'Temporary removed, floor sound and the tooth is asymptomatic. Matrix placed, ready for condensation.',
        procedures: [],
        materials: [],
      },
      {
        title: 'Class I composite restoration — tooth 47',
        status: TreatmentSessionStatus.UPCOMING,
        appointment: {
          dayOffset: 7,
          start: '09:00',
          durationMinutes: 90,
          status: ClinicalAppointmentStatus.SCHEDULED,
        },
        procedures: [],
        materials: [],
      },
    ],
    caseMedia: [
      {
        slug: 'postop-26',
        label: 'Post-operative photograph — tooth 26',
        description:
          'Finished Class II composite with restored proximal contact.',
      },
      {
        slug: 'postop-27',
        label: 'Post-operative photograph — tooth 27',
        description: 'Class I composite, occlusion checked.',
      },
      {
        slug: 'temporary-37',
        label: 'Temporary restoration in place — tooth 37',
        description: 'Calcium hydroxide liner under a temporary dressing.',
      },
    ],
  },
  {
    key: 'case.treatment.periodontics-absence',
    title: 'Treatment in progress — includes a missed appointment',
    targetStage: ClinicalCaseStatus.TREATMENT_IN_PROGRESS,
    patientKey: 'patient.fadi',
    subjectKey: 'subject.periodontics',
    studentKey: 'student.karim',
    request: {
      chiefComplaint: 'Bleeding gums and bad breath',
      symptoms:
        'Gums bleed on brushing every day, persistent bad taste, some teeth feel loose. Has not seen a dentist in four years.',
      teeth: [11, 16, 26, 36],
      submittedDayOffset: -27,
      attachments: [],
    },
    examinationVisit: {
      dayOffset: -24,
      start: '12:00',
      durationMinutes: 30,
      status: ExaminationAppointmentStatus.COMPLETED,
    },
    initialExamination: {
      clinicalFindings:
        'Generalised heavy supragingival calculus, bleeding on probing at 78% of sites, pocket depths 5–7 mm in the posterior sextants with grade I mobility on 36. Horizontal bone loss of about 30% on the panoramic radiograph. Walk-in patient registered at the desk.',
      diagnosis:
        'Generalised chronic periodontitis, stage III grade B, with heavy calculus deposits.',
      status: InitialExaminationStatus.COMPLETED,
    },
    assignment: {
      dayOffset: -21,
      start: '12:00',
      durationMinutes: 60,
      status: ClinicalAppointmentStatus.COMPLETED,
    },
    diagnosis: {
      submittedDayOffset: -21,
      images: [
        {
          slug: 'perio-chart-baseline',
          label: 'Baseline periodontal chart',
          description: 'Six-point pocket chart with bleeding scores.',
        },
        {
          slug: 'panoramic-perio',
          label: 'Panoramic radiograph',
          description: 'Generalised horizontal bone loss.',
        },
      ],
      review: {
        notes:
          'Approved. Complete the hygiene phase before any subgingival instrumentation and re-chart before the final quadrant.',
        dayOffset: -20,
      },
      procedures: [
        {
          procedure: 'Supragingival Scaling',
          tooth: 11,
          status: PlannedProceduresStatus.COMPLETED,
        },
        {
          procedure: 'Scaling and Root Planing — Quadrant',
          tooth: 16,
          status: PlannedProceduresStatus.COMPLETED,
        },
        {
          procedure: 'Scaling and Root Planing — Quadrant',
          tooth: 26,
          status: PlannedProceduresStatus.PLANNED,
        },
        {
          procedure: 'Scaling and Root Planing — Quadrant',
          tooth: 36,
          status: PlannedProceduresStatus.PLANNED,
        },
      ],
    },
    sessions: [
      {
        title: 'Full-mouth supragingival scaling and hygiene instruction',
        status: TreatmentSessionStatus.COMPLETED,
        appointment: {
          dayOffset: -17,
          start: '12:00',
          durationMinutes: 60,
          status: ClinicalAppointmentStatus.COMPLETED,
        },
        studentNotes:
          'Ultrasonic debridement of all quadrants, heavy calculus removed. Modified Bass technique and interdental brushes demonstrated. Chlorhexidine rinse prescribed for two weeks.',
        supervisorNotes:
          'Thorough debridement. Reinforce interdental cleaning at the next visit — plaque score is still high on the lower anteriors.',
        procedures: [{ procedure: 'Supragingival Scaling', tooth: 11 }],
        materials: [
          'material.ultrasonic-tip',
          'material.chlorhexidine',
          'material.periodontal-probe',
          'material.cotton-rolls',
        ],
      },
      {
        title: 'Root surface instrumentation — upper right quadrant',
        status: TreatmentSessionStatus.COMPLETED,
        appointment: {
          dayOffset: -10,
          start: '12:00',
          durationMinutes: 60,
          status: ClinicalAppointmentStatus.COMPLETED,
        },
        studentNotes:
          'Infiltration anaesthesia. Gracey curettes used on all upper right sites, root surfaces smooth on re-instrumentation. Post-operative instructions given.',
        supervisorNotes:
          'Good instrumentation of the palatal sites, which were the deepest. Plaque control has improved since the first visit.',
        procedures: [
          { procedure: 'Scaling and Root Planing — Quadrant', tooth: 16 },
        ],
        materials: [
          'material.anesthetic',
          'material.gracey-curette',
          'material.chlorhexidine',
          'material.cotton-rolls',
        ],
      },
      {
        title: 'Root surface instrumentation — upper left quadrant',
        status: TreatmentSessionStatus.PATIENT_ABSENT,
        appointment: {
          dayOffset: -3,
          start: '12:00',
          durationMinutes: 60,
          status: ClinicalAppointmentStatus.NO_SHOW,
        },
        supervisorNotes:
          'Patient did not attend and could not be reached by phone. Re-appointed; warn about the effect of interrupted therapy.',
        procedures: [],
        materials: [],
      },
      {
        title: 'Root surface instrumentation — upper left quadrant (re-booked)',
        status: TreatmentSessionStatus.UPCOMING,
        appointment: {
          dayOffset: 4,
          start: '12:00',
          durationMinutes: 60,
          status: ClinicalAppointmentStatus.SCHEDULED,
        },
        procedures: [],
        materials: [],
      },
    ],
    caseMedia: [
      {
        slug: 'hygiene-phase-review',
        label: 'Photograph after the hygiene phase',
        description:
          'Reduced marginal inflammation two weeks after debridement.',
      },
    ],
  },

  // ───────────────────── AWAITING_CASE_REVIEW ─────────────────────
  {
    key: 'case.awaiting-review.restorative',
    title: 'Treatment finished — waiting for the supervisor evaluation',
    targetStage: ClinicalCaseStatus.AWAITING_CASE_REVIEW,
    patientKey: 'patient.leen',
    subjectKey: 'subject.restorative',
    studentKey: 'student.dana',
    request: {
      chiefComplaint: 'Two small cavities and a sensitive notch near the gum',
      symptoms:
        'Cavities noticed at a check-up. Sharp sensitivity to cold at the gum line on the upper left when brushing.',
      teeth: [14, 15, 24],
      submittedDayOffset: -33,
      attachments: [],
    },
    examinationVisit: {
      dayOffset: -30,
      start: '10:00',
      durationMinutes: 30,
      status: ExaminationAppointmentStatus.COMPLETED,
    },
    initialExamination: {
      clinicalFindings:
        'Occlusal caries on 15 and a distal proximal lesion on 14 confirmed radiographically. Cervical abrasion cavity on the buccal of 24 with dentine hypersensitivity. All teeth vital.',
      diagnosis:
        'Class I caries on 15, Class II caries on 14, cervical abrasion lesion on 24.',
      status: InitialExaminationStatus.COMPLETED,
    },
    assignment: {
      dayOffset: -27,
      start: '10:00',
      durationMinutes: 90,
      status: ClinicalAppointmentStatus.COMPLETED,
    },
    diagnosis: {
      submittedDayOffset: -27,
      images: [
        {
          slug: 'bitewings-preop',
          label: 'Pre-operative bitewing radiographs',
          description: 'Proximal lesion on the distal of 14.',
        },
        {
          slug: 'cervical-lesion-24',
          label: 'Cervical abrasion lesion — tooth 24',
        },
      ],
      review: {
        notes:
          'Plan approved, including the glass ionomer choice for 24. Record the brushing technique advice in the notes.',
        dayOffset: -26,
      },
      procedures: [
        {
          procedure: 'Class I Composite Restoration',
          tooth: 15,
          status: PlannedProceduresStatus.COMPLETED,
        },
        {
          procedure: 'Class II Composite Restoration',
          tooth: 14,
          status: PlannedProceduresStatus.COMPLETED,
        },
        {
          procedure: 'Glass Ionomer Restoration',
          tooth: 24,
          status: PlannedProceduresStatus.COMPLETED,
        },
      ],
    },
    sessions: [
      {
        title: 'Class I composite restoration — tooth 15',
        status: TreatmentSessionStatus.COMPLETED,
        appointment: {
          dayOffset: -20,
          start: '10:00',
          durationMinutes: 90,
          status: ClinicalAppointmentStatus.COMPLETED,
        },
        studentNotes:
          'Caries removed, no pulp exposure. Composite placed incrementally, occlusion checked with articulating paper.',
        supervisorNotes: 'Clean margins and correct shade selection. Accepted.',
        procedures: [{ procedure: 'Class I Composite Restoration', tooth: 15 }],
        materials: [
          'material.anesthetic',
          'material.etchant',
          'material.bonding-agent',
          'material.composite-a2',
          'material.cotton-rolls',
        ],
      },
      {
        title: 'Class II composite restoration — tooth 14',
        status: TreatmentSessionStatus.COMPLETED,
        appointment: {
          dayOffset: -12,
          start: '10:00',
          durationMinutes: 90,
          status: ClinicalAppointmentStatus.COMPLETED,
        },
        studentNotes:
          'Sectional matrix used, proximal contact verified with floss. Finished and polished.',
        supervisorNotes:
          'Contact point and marginal ridge height are correct. Good progress.',
        procedures: [
          { procedure: 'Class II Composite Restoration', tooth: 14 },
        ],
        materials: [
          'material.anesthetic',
          'material.etchant',
          'material.bonding-agent',
          'material.composite-a2',
          'material.matrix-band',
          'material.cotton-rolls',
        ],
      },
      {
        title: 'Glass ionomer restoration — tooth 24',
        status: TreatmentSessionStatus.COMPLETED,
        appointment: {
          dayOffset: -5,
          start: '10:00',
          durationMinutes: 60,
          status: ClinicalAppointmentStatus.COMPLETED,
        },
        studentNotes:
          'Cervical lesion cleaned and conditioned, glass ionomer placed and protected. Brushing technique corrected and demonstrated to the patient.',
        supervisorNotes:
          'Restoration well adapted. Sensitivity should resolve; review at recall.',
        procedures: [{ procedure: 'Glass Ionomer Restoration', tooth: 24 }],
        materials: ['material.glass-ionomer', 'material.cotton-rolls'],
      },
    ],
    caseMedia: [
      {
        slug: 'postop-14-15',
        label: 'Post-operative photograph — teeth 14 and 15',
      },
      {
        slug: 'postop-24',
        label: 'Post-operative photograph — tooth 24',
        description: 'Glass ionomer restoration of the cervical lesion.',
      },
      {
        slug: 'postop-bitewings',
        label: 'Post-operative bitewing radiographs',
        description: 'Marginal adaptation of both restorations verified.',
      },
    ],
  },

  // ─────────────────────────── COMPLETED ──────────────────────────
  {
    key: 'case.completed.restorative',
    title: 'Completed and graded — anticoagulated patient',
    targetStage: ClinicalCaseStatus.COMPLETED,
    patientKey: 'patient.tarek',
    subjectKey: 'subject.restorative',
    studentKey: 'student.omar',
    request: {
      chiefComplaint: 'Broken filling in the lower right',
      symptoms:
        'A filling broke three weeks ago, food collects in the cavity. No pain. Taking warfarin.',
      teeth: [46, 47],
      submittedDayOffset: -58,
      attachments: [],
    },
    examinationVisit: {
      dayOffset: -55,
      start: '09:30',
      durationMinutes: 30,
      status: ExaminationAppointmentStatus.COMPLETED,
    },
    initialExamination: {
      clinicalFindings:
        'Fractured mesio-occlusal restoration on 46 with recurrent caries, and a defective occlusal amalgam on 47. Both vital and asymptomatic. Anticoagulated — no surgical procedure planned, so no INR restriction for this treatment.',
      diagnosis:
        'Fractured restoration with recurrent caries on 46, defective amalgam on 47.',
      status: InitialExaminationStatus.COMPLETED,
    },
    assignment: {
      dayOffset: -52,
      start: '09:30',
      durationMinutes: 90,
      status: ClinicalAppointmentStatus.COMPLETED,
    },
    diagnosis: {
      submittedDayOffset: -52,
      images: [
        {
          slug: 'preop-lower-right',
          label: 'Pre-operative photograph — lower right quadrant',
        },
        {
          slug: 'bitewing-right-preop',
          label: 'Right bitewing radiograph',
          description:
            'Recurrent caries beneath the fractured restoration on 46.',
        },
      ],
      review: {
        notes:
          'Approved. Confirm with the patient that anticoagulation continues unchanged and avoid subgingival matrix placement.',
        dayOffset: -51,
      },
      procedures: [
        {
          procedure: 'Class II Composite Restoration',
          tooth: 46,
          status: PlannedProceduresStatus.COMPLETED,
        },
        {
          procedure: 'Amalgam Restoration',
          tooth: 47,
          status: PlannedProceduresStatus.COMPLETED,
        },
      ],
    },
    sessions: [
      {
        title: 'Class II composite restoration — tooth 46',
        status: TreatmentSessionStatus.COMPLETED,
        appointment: {
          dayOffset: -45,
          start: '09:30',
          durationMinutes: 90,
          status: ClinicalAppointmentStatus.COMPLETED,
        },
        studentNotes:
          'Old restoration and recurrent caries removed, no pulp exposure. Matrix placed supragingivally, composite built up incrementally, contact verified.',
        supervisorNotes:
          'Handled the soft tissues carefully as instructed. No bleeding complication. Restoration accepted.',
        procedures: [
          { procedure: 'Class II Composite Restoration', tooth: 46 },
        ],
        materials: [
          'material.anesthetic',
          'material.etchant',
          'material.bonding-agent',
          'material.composite-a2',
          'material.matrix-band',
          'material.cotton-rolls',
        ],
      },
      {
        title: 'Amalgam restoration — tooth 47',
        status: TreatmentSessionStatus.COMPLETED,
        appointment: {
          dayOffset: -38,
          start: '09:30',
          durationMinutes: 90,
          status: ClinicalAppointmentStatus.COMPLETED,
        },
        studentNotes:
          'Defective amalgam replaced, retentive preparation refined, alloy condensed and carved. Occlusion adjusted and the patient advised to avoid chewing for two hours.',
        supervisorNotes:
          'Anatomy and marginal integrity are good. Case complete.',
        procedures: [{ procedure: 'Amalgam Restoration', tooth: 47 }],
        materials: [
          'material.anesthetic',
          'material.amalgam-capsule',
          'material.matrix-band',
          'material.cotton-rolls',
        ],
      },
    ],
    caseMedia: [
      {
        slug: 'postop-46-47',
        label: 'Post-operative photograph — teeth 46 and 47',
      },
      {
        slug: 'postop-bitewing-right',
        label: 'Post-operative bitewing radiograph',
      },
    ],
    evaluation: {
      grade: Grade.A_MINUS,
      comment:
        'Well-managed case in a medically compromised patient. The student checked the anticoagulation status independently, sequenced the visits sensibly and produced two sound restorations. Documentation was complete and on time. Marginal finish on 47 could be slightly smoother.',
      dayOffset: -30,
    },
  },
  {
    key: 'case.completed.endodontics',
    title: 'Completed and graded — multi-visit root canal treatment',
    targetStage: ClinicalCaseStatus.COMPLETED,
    patientKey: 'patient.nadia',
    subjectKey: 'subject.endodontics',
    studentKey: 'student.rita',
    request: {
      chiefComplaint: 'Severe pain in an upper front tooth',
      symptoms:
        'Sudden severe pain in the upper left front tooth two days ago, keeping her awake. The tooth was injured years ago.',
      teeth: [22],
      submittedDayOffset: -52,
      attachments: [
        {
          slug: 'patient-photo-anterior',
          label: 'Photo of the upper front teeth taken by the patient',
        },
      ],
    },
    examinationVisit: {
      dayOffset: -50,
      start: '11:30',
      durationMinutes: 30,
      status: ExaminationAppointmentStatus.COMPLETED,
    },
    initialExamination: {
      clinicalFindings:
        'Tooth 22 slightly discoloured with a history of trauma, exquisitely tender to percussion, no response to cold. Periapical radiograph shows a well-defined 4 mm periapical radiolucency. Single canal, no calcification visible.',
      diagnosis:
        'Pulp necrosis with symptomatic apical periodontitis following previous trauma, tooth 22.',
      status: InitialExaminationStatus.COMPLETED,
    },
    assignment: {
      dayOffset: -47,
      start: '11:30',
      durationMinutes: 90,
      status: ClinicalAppointmentStatus.COMPLETED,
    },
    diagnosis: {
      submittedDayOffset: -47,
      images: [
        {
          slug: 'periapical-22-preop',
          label: 'Pre-operative periapical radiograph — tooth 22',
          description: 'Well-defined periapical radiolucency of about 4 mm.',
        },
        {
          slug: 'intraoral-anterior',
          label: 'Intra-oral photograph — upper anterior region',
          description: 'Greyish discolouration of the crown of 22.',
        },
      ],
      review: {
        notes:
          'Approved. Note the ibuprofen intolerance in the analgesia plan and take a working-length film before instrumentation.',
        dayOffset: -46,
      },
      procedures: [
        {
          procedure: 'Emergency Pulpectomy',
          tooth: 22,
          status: PlannedProceduresStatus.COMPLETED,
        },
        {
          procedure: 'Single-Canal Root Canal Treatment',
          tooth: 22,
          status: PlannedProceduresStatus.COMPLETED,
        },
      ],
    },
    sessions: [
      {
        title: 'Emergency pulpectomy — tooth 22',
        status: TreatmentSessionStatus.COMPLETED,
        appointment: {
          dayOffset: -40,
          start: '11:30',
          durationMinutes: 90,
          status: ClinicalAppointmentStatus.COMPLETED,
        },
        studentNotes:
          'Access cavity prepared under rubber dam, necrotic pulp extirpated, canal irrigated with sodium hypochlorite. Calcium hydroxide dressing placed and the access temporised. Paracetamol advised instead of ibuprofen.',
        supervisorNotes:
          'Access outline is correct and conservative. Patient reported immediate relief.',
        procedures: [{ procedure: 'Emergency Pulpectomy', tooth: 22 }],
        materials: [
          'material.anesthetic',
          'material.rubber-dam',
          'material.sodium-hypochlorite',
          'material.calcium-hydroxide',
          'material.k-files',
        ],
      },
      {
        title: 'Canal preparation and inter-visit dressing — tooth 22',
        status: TreatmentSessionStatus.COMPLETED,
        appointment: {
          dayOffset: -33,
          start: '11:30',
          durationMinutes: 90,
          status: ClinicalAppointmentStatus.COMPLETED,
        },
        studentNotes:
          'Working length confirmed radiographically at 22 mm. Canal prepared to size 40, irrigated with sodium hypochlorite and EDTA. Calcium hydroxide replaced and the tooth temporised.',
        supervisorNotes:
          'Working length film is clear and the preparation taper is even. Continue to obturation.',
        procedures: [
          { procedure: 'Single-Canal Root Canal Treatment', tooth: 22 },
        ],
        materials: [
          'material.rubber-dam',
          'material.k-files',
          'material.sodium-hypochlorite',
          'material.edta',
          'material.calcium-hydroxide',
        ],
      },
      {
        title: 'Obturation and coronal seal — tooth 22',
        status: TreatmentSessionStatus.COMPLETED,
        appointment: {
          dayOffset: -26,
          start: '11:30',
          durationMinutes: 90,
          status: ClinicalAppointmentStatus.COMPLETED,
        },
        studentNotes:
          'Tooth asymptomatic. Canal dried, obturated with lateral condensation of gutta-percha and AH Plus sealer, and the access sealed with composite. Post-operative radiograph shows obturation to length.',
        supervisorNotes:
          'Dense, well-condensed obturation to the correct length with an adequate coronal seal. Case finished to a high standard.',
        procedures: [
          { procedure: 'Single-Canal Root Canal Treatment', tooth: 22 },
        ],
        materials: [
          'material.rubber-dam',
          'material.gutta-percha',
          'material.ah-plus-sealer',
          'material.composite-a2',
        ],
      },
    ],
    caseMedia: [
      {
        slug: 'working-length-22',
        label: 'Working length radiograph — tooth 22',
      },
      {
        slug: 'postop-periapical-22',
        label: 'Post-operative periapical radiograph — tooth 22',
        description: 'Obturation to length with an intact coronal seal.',
      },
      {
        slug: 'postop-anterior-photo',
        label: 'Post-operative intra-oral photograph',
      },
    ],
    evaluation: {
      grade: Grade.B_PLUS,
      comment:
        'Sound multi-visit endodontic management with a high-quality obturation and clear documentation at every visit. Diagnosis and treatment plan were accurate. The first visit ran over time and the working-length film needed to be repeated once, which is the main area to improve.',
      dayOffset: -20,
    },
  },
];

/**
 * Requests that have not become cases. They keep the coordinator's queue
 * populated, which is otherwise empty once every request has been converted.
 */
export const PENDING_REQUESTS: PendingRequestBlueprint[] = [
  {
    key: 'request.pending.scheduled',
    title: 'Pending request — examination already booked',
    patientKey: 'patient.ghassan',
    request: {
      chiefComplaint: 'Loose lower front teeth and bleeding gums',
      symptoms:
        'Lower front teeth have become mobile over the past few months, gums bleed when brushing. Long-term bisphosphonate therapy.',
      teeth: [31, 41],
      submittedDayOffset: -2,
      attachments: [
        {
          slug: 'medication-list',
          label: 'Photograph of the current medication list',
          mimeType: 'application/pdf',
        },
      ],
    },
    examinationVisit: {
      dayOffset: 2,
      start: '09:30',
      durationMinutes: 30,
      status: ExaminationAppointmentStatus.SCHEDULED,
    },
  },
  {
    key: 'request.pending.unscheduled',
    title: 'Pending request — returning patient, no slot yet',
    patientKey: 'patient.tarek',
    request: {
      chiefComplaint: 'Chipped upper front tooth',
      symptoms:
        'Chipped the corner of an upper front tooth on a fork yesterday. No pain, but the edge is sharp.',
      teeth: [11],
      submittedDayOffset: -1,
      attachments: [],
    },
  },
];
