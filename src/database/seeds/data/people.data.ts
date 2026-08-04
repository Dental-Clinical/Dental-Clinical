import { UserRole } from 'src/constants/user-roles';

export interface StaffBlueprint {
  key: string;
  fullName: string;
  fatherName: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface StudentBlueprint extends StaffBlueprint {
  universityId: string;
  /** Clinic section the student rotates through this term. */
  sectionKey: string;
  studyYearKey: string;
}

export const ADMIN: StaffBlueprint = {
  key: 'admin',
  fullName: 'Lina Haddad',
  fatherName: 'Samir',
  email: 'admin@dental.edu',
  phone: '+963911000001',
  role: UserRole.ADMIN,
};

export const COORDINATOR: StaffBlueprint = {
  key: 'coordinator',
  fullName: 'Maha Darwish',
  fatherName: 'Fouad',
  email: 'coordinator@dental.edu',
  phone: '+963911000002',
  role: UserRole.COORDINATOR,
};

export const SUPERVISORS: StaffBlueprint[] = [
  {
    key: 'supervisor.restorative',
    fullName: 'Yaser Al-Khatib',
    fatherName: 'Mahmoud',
    email: 'y.alkhatib@dental.edu',
    phone: '+963911000010',
    role: UserRole.SUPERVISOR,
  },
  {
    key: 'supervisor.endo-perio',
    fullName: 'Nour Sabbagh',
    fatherName: 'Adnan',
    email: 'n.sabbagh@dental.edu',
    phone: '+963911000011',
    role: UserRole.SUPERVISOR,
  },
];

/**
 * Five students split across both clinic sections. Two of them (Omar, Rita)
 * carry a completed case each, so the dashboard has students with history
 * standing next to students still on their first case.
 */
export const STUDENTS: StudentBlueprint[] = [
  {
    key: 'student.omar',
    fullName: 'Omar Nasser',
    fatherName: 'Ziad',
    email: 'omar.nasser@student.dental.edu',
    phone: '+963911000101',
    role: UserRole.STUDENT,
    universityId: '2126001',
    sectionKey: 'section.a',
    studyYearKey: 'year.4',
  },
  {
    key: 'student.rita',
    fullName: 'Rita Khoury',
    fatherName: 'Elias',
    email: 'rita.khoury@student.dental.edu',
    phone: '+963911000102',
    role: UserRole.STUDENT,
    universityId: '2126002',
    sectionKey: 'section.b',
    studyYearKey: 'year.4',
  },
  {
    key: 'student.sami',
    fullName: 'Sami Barakat',
    fatherName: 'Nabil',
    email: 'sami.barakat@student.dental.edu',
    phone: '+963911000103',
    role: UserRole.STUDENT,
    universityId: '2126003',
    sectionKey: 'section.a',
    studyYearKey: 'year.4',
  },
  {
    key: 'student.dana',
    fullName: 'Dana Hallak',
    fatherName: 'Riad',
    email: 'dana.hallak@student.dental.edu',
    phone: '+963911000104',
    role: UserRole.STUDENT,
    universityId: '2126004',
    sectionKey: 'section.a',
    studyYearKey: 'year.4',
  },
  {
    key: 'student.karim',
    fullName: 'Karim Ayoub',
    fatherName: 'Wael',
    email: 'karim.ayoub@student.dental.edu',
    phone: '+963911000105',
    role: UserRole.STUDENT,
    universityId: '2126005',
    sectionKey: 'section.b',
    studyYearKey: 'year.5',
  },
];
