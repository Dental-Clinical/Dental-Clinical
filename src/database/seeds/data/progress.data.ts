export interface CarryOverCredit {
  studentKey: string;
  subjectKey: string;
  /** Must match a `SubjectProcedures.name` of that subject. */
  procedure: string;
  count: number;
}

/**
 * Credit earned earlier in the term, on cases that are not part of this seed.
 *
 * Without it every student would sit at 0 or 1 of a requirement of 3–5, and the
 * progress screen would have no partial bars, no completed requirements and no
 * meaningful ordering to render. The counts below are chosen so the requirement
 * table shows all three states at once: untouched, part-way, and met.
 */
export const CARRY_OVER_CREDIT: CarryOverCredit[] = [
  // Omar — mid-term, solid restorative progress.
  {
    studentKey: 'student.omar',
    subjectKey: 'subject.restorative',
    procedure: 'Class I Composite Restoration',
    count: 2,
  },
  {
    studentKey: 'student.omar',
    subjectKey: 'subject.restorative',
    procedure: 'Class II Composite Restoration',
    count: 1,
  },
  {
    studentKey: 'student.omar',
    subjectKey: 'subject.restorative',
    procedure: 'Amalgam Restoration',
    count: 1,
  },

  // Rita — close to finishing her endodontic requirements.
  {
    studentKey: 'student.rita',
    subjectKey: 'subject.endodontics',
    procedure: 'Single-Canal Root Canal Treatment',
    count: 1,
  },
  {
    studentKey: 'student.rita',
    subjectKey: 'subject.endodontics',
    procedure: 'Pulpotomy',
    count: 2,
  },

  // Sami — early in the term.
  {
    studentKey: 'student.sami',
    subjectKey: 'subject.restorative',
    procedure: 'Class I Composite Restoration',
    count: 1,
  },

  // Dana — her first case is still awaiting review, so nothing has been
  // credited from it yet; this is all she has.
  {
    studentKey: 'student.dana',
    subjectKey: 'subject.restorative',
    procedure: 'Class I Composite Restoration',
    count: 2,
  },
  {
    studentKey: 'student.dana',
    subjectKey: 'subject.restorative',
    procedure: 'Glass Ionomer Restoration',
    count: 1,
  },

  // Karim — fifth year, periodontics.
  {
    studentKey: 'student.karim',
    subjectKey: 'subject.periodontics',
    procedure: 'Supragingival Scaling',
    count: 2,
  },
  {
    studentKey: 'student.karim',
    subjectKey: 'subject.periodontics',
    procedure: 'Scaling and Root Planing — Quadrant',
    count: 1,
  },
];
