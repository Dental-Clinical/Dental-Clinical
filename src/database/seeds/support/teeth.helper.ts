/**
 * FDI two-digit notation helpers.
 *
 * The seed writes tooth numbers into examination requests and planned
 * procedures; using real FDI numbers (and rejecting impossible ones at build
 * time) keeps the dataset credible to the dental staff who will demo it.
 */

const QUADRANT_LABEL: Record<number, string> = {
  1: 'upper right',
  2: 'upper left',
  3: 'lower left',
  4: 'lower right',
};

const POSITION_LABEL: Record<number, string> = {
  1: 'central incisor',
  2: 'lateral incisor',
  3: 'canine',
  4: 'first premolar',
  5: 'second premolar',
  6: 'first molar',
  7: 'second molar',
  8: 'third molar',
};

export function isValidTooth(tooth: number): boolean {
  const quadrant = Math.floor(tooth / 10);
  const position = tooth % 10;
  return quadrant >= 1 && quadrant <= 4 && position >= 1 && position <= 8;
}

export function assertValidTeeth(teeth: number[], context: string): void {
  const invalid = teeth.filter((tooth) => !isValidTooth(tooth));
  if (invalid.length > 0) {
    throw new Error(
      `${context}: [${invalid.join(', ')}] are not valid FDI tooth numbers.`,
    );
  }
}

/** e.g. 36 → "tooth 36 (lower left first molar)" */
export function describeTooth(tooth: number): string {
  if (!isValidTooth(tooth)) return `tooth ${tooth}`;
  const quadrant = QUADRANT_LABEL[Math.floor(tooth / 10)];
  const position = POSITION_LABEL[tooth % 10];
  return `tooth ${tooth} (${quadrant} ${position})`;
}

export function describeTeeth(teeth: number[]): string {
  return teeth.map(describeTooth).join(', ');
}
