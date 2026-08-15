export enum Grade {
  A_PLUS = 'A+',
  A = 'A',
  A_MINUS = 'A-',
  B_PLUS = 'B+',
  B = 'B',
  B_MINUS = 'B-',
  C_PLUS = 'C+',
  C = 'C',
  C_MINUS = 'C-',
  D_PLUS = 'D+',
  D = 'D',
  F = 'F',
}

/**
 * Grade to points on the standard 4.0 scale, for averaging a student's case
 * evaluations. The faculty has no other numeric scale recorded anywhere in the
 * system, so this is the single place to change if theirs differs.
 */
export const GRADE_POINTS: Record<Grade, number> = {
  [Grade.A_PLUS]: 4,
  [Grade.A]: 4,
  [Grade.A_MINUS]: 3.7,
  [Grade.B_PLUS]: 3.3,
  [Grade.B]: 3,
  [Grade.B_MINUS]: 2.7,
  [Grade.C_PLUS]: 2.3,
  [Grade.C]: 2,
  [Grade.C_MINUS]: 1.7,
  [Grade.D_PLUS]: 1.3,
  [Grade.D]: 1,
  [Grade.F]: 0,
};
