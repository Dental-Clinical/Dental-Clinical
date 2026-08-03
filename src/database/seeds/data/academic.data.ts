export interface StudyYearBlueprint {
  key: string;
  name: string;
  level: number;
}

export interface SectionBlueprint {
  key: string;
  name: string;
  supervisorKey: string;
}

export interface SubjectBlueprint {
  key: string;
  name: string;
  description: string;
  studyYearKey: string;
  sectionKey: string;
  procedures: SubjectProcedureBlueprint[];
  /** Material keys stocked for this subject (subject_materials join). */
  materialKeys: string[];
}

export interface SubjectProcedureBlueprint {
  name: string;
  description: string;
  /** Cases a student must complete before the requirement is met. */
  requiredCount: number;
}

export const STUDY_YEARS: StudyYearBlueprint[] = [
  { key: 'year.4', name: 'Fourth Year', level: 4 },
  { key: 'year.5', name: 'Fifth Year', level: 5 },
];

export const SECTIONS: SectionBlueprint[] = [
  {
    key: 'section.a',
    name: 'Section A — Restorative Clinic',
    supervisorKey: 'supervisor.restorative',
  },
  {
    key: 'section.b',
    name: 'Section B — Endodontics & Periodontics Clinic',
    supervisorKey: 'supervisor.endo-perio',
  },
];

/**
 * Three subjects, two sections, two study years. Enough breadth that the
 * frontend's subject filters, section routing and "which supervisor owns this
 * case" logic are all exercised, without inflating the dataset.
 */
export const SUBJECTS: SubjectBlueprint[] = [
  {
    key: 'subject.restorative',
    name: 'Restorative Dentistry',
    description:
      'Direct and indirect restoration of carious and fractured teeth.',
    studyYearKey: 'year.4',
    sectionKey: 'section.a',
    materialKeys: [
      'material.anesthetic',
      'material.composite-a2',
      'material.etchant',
      'material.bonding-agent',
      'material.matrix-band',
      'material.amalgam-capsule',
      'material.glass-ionomer',
      'material.cotton-rolls',
    ],
    procedures: [
      {
        name: 'Class I Composite Restoration',
        description: 'Occlusal composite restoration on a posterior tooth.',
        requiredCount: 5,
      },
      {
        name: 'Class II Composite Restoration',
        description:
          'Proximal-occlusal composite restoration requiring matrix isolation.',
        requiredCount: 4,
      },
      {
        name: 'Amalgam Restoration',
        description:
          'Posterior amalgam restoration with retention preparation.',
        requiredCount: 3,
      },
      {
        name: 'Glass Ionomer Restoration',
        description: 'Cervical or root-surface glass ionomer restoration.',
        requiredCount: 2,
      },
    ],
  },
  {
    key: 'subject.endodontics',
    name: 'Endodontics',
    description: 'Diagnosis and treatment of pulpal and periapical pathology.',
    studyYearKey: 'year.4',
    sectionKey: 'section.b',
    materialKeys: [
      'material.anesthetic',
      'material.gutta-percha',
      'material.sodium-hypochlorite',
      'material.edta',
      'material.calcium-hydroxide',
      'material.ah-plus-sealer',
      'material.k-files',
      'material.rubber-dam',
      'material.cotton-rolls',
    ],
    procedures: [
      {
        name: 'Single-Canal Root Canal Treatment',
        description:
          'Complete chemo-mechanical preparation and obturation of one canal.',
        requiredCount: 3,
      },
      {
        name: 'Multi-Canal Root Canal Treatment',
        description: 'Molar endodontic treatment with three or more canals.',
        requiredCount: 2,
      },
      {
        name: 'Pulpotomy',
        description: 'Removal of coronal pulp tissue with medicament dressing.',
        requiredCount: 2,
      },
      {
        name: 'Emergency Pulpectomy',
        description: 'Pain-relief pulpectomy for acute irreversible pulpitis.',
        requiredCount: 1,
      },
    ],
  },
  {
    key: 'subject.periodontics',
    name: 'Periodontics',
    description:
      'Management of gingival and periodontal disease, including surgical therapy.',
    studyYearKey: 'year.5',
    sectionKey: 'section.b',
    materialKeys: [
      'material.anesthetic',
      'material.ultrasonic-tip',
      'material.gracey-curette',
      'material.chlorhexidine',
      'material.periodontal-probe',
      'material.cotton-rolls',
    ],
    procedures: [
      {
        name: 'Scaling and Root Planing — Quadrant',
        description:
          'Subgingival instrumentation of one quadrant under anaesthesia.',
        requiredCount: 4,
      },
      {
        name: 'Supragingival Scaling',
        description: 'Full-mouth removal of supragingival calculus and stain.',
        requiredCount: 3,
      },
      {
        name: 'Gingivectomy',
        description: 'Surgical excision of hyperplastic gingival tissue.',
        requiredCount: 1,
      },
    ],
  },
];
