import { DayOfWeek } from 'src/constants/day-of-week';

/** Clinic week used across the school: Sunday through Thursday. */
export const CLINIC_DAYS: DayOfWeek[] = [
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
];

const JS_DAY_TO_ENUM: DayOfWeek[] = [
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
];

function isClinicDay(date: Date): boolean {
  return CLINIC_DAYS.includes(JS_DAY_TO_ENUM[date.getDay()]);
}

/**
 * Every date in the seed is expressed as an offset from a single anchor, so the
 * dataset stays coherent whenever it is re-run: "yesterday's completed session"
 * is always yesterday, never a hardcoded date that rots into the past.
 *
 * The anchor is snapped forward onto a clinic day. Otherwise a run on a Friday
 * would place "today's active session" on a day no supervisor is rostered, and
 * the frontend's schedule views would render an empty week.
 */
export class SeedClock {
  readonly today: Date;

  constructor(anchor: Date) {
    const date = startOfDay(anchor);
    while (!isClinicDay(date)) {
      date.setDate(date.getDate() + 1);
    }
    this.today = date;
  }

  /** Calendar day at `offset` days from the anchor (negative = past). */
  day(offset: number): Date {
    const date = new Date(this.today);
    date.setDate(date.getDate() + offset);
    return date;
  }

  /**
   * Same as `day()` but snapped onto a clinic day — away from the anchor, so a
   * past offset never becomes a future date and vice versa.
   */
  clinicDay(offset: number): Date {
    const date = this.day(offset);
    const step = offset < 0 ? -1 : 1;
    while (!isClinicDay(date)) {
      date.setDate(date.getDate() + step);
    }
    return date;
  }

  /** `date` combined with a 'HH:mm' wall-clock time. */
  at(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const stamp = new Date(date);
    stamp.setHours(hours, minutes, 0, 0);
    return stamp;
  }

  /** Postgres `date` columns take 'YYYY-MM-DD'; sending a Date shifts by timezone. */
  dateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  dayOfWeek(date: Date): DayOfWeek {
    return JS_DAY_TO_ENUM[date.getDay()];
  }

  /** Academic year boundaries around the anchor: September through June. */
  academicYearBounds(): { label: string; start: Date; end: Date } {
    const year =
      this.today.getMonth() >= 8
        ? this.today.getFullYear()
        : this.today.getFullYear() - 1;
    return {
      label: `${year}-${year + 1}`,
      start: new Date(year, 8, 1),
      end: new Date(year + 1, 5, 30),
    };
  }
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Adds minutes to a 'HH:mm' time string. */
export function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const total = hours * 60 + mins + minutes;
  const hh = `${Math.floor(total / 60) % 24}`.padStart(2, '0');
  const mm = `${total % 60}`.padStart(2, '0');
  return `${hh}:${mm}`;
}
