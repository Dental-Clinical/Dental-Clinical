export interface PatientBlueprint {
  key: string;
  fullName: string;
  phone: string;
  /** Age at the anchor date; the seeder converts it into a date of birth. */
  age: number;
  gender: 'Male' | 'Female';
  /** Walk-ins are registered at the desk and have no login. */
  isWalkin: boolean;
  medicalHistory: string;
  allergies: string;
  currentMedications: string;
}

/**
 * Ten patients with medical histories that actually interact with dental
 * treatment — anticoagulants, uncontrolled diabetes, penicillin allergy,
 * bisphosphonates. These are the fields a supervisor checks before approving a
 * plan, so they need to carry real signal rather than lorem text.
 */
export const PATIENTS: PatientBlueprint[] = [
  {
    key: 'patient.salma',
    fullName: 'Salma Deeb',
    phone: '+963933200001',
    age: 29,
    gender: 'Female',
    isWalkin: false,
    medicalHistory: 'Fit and well. No systemic disease.',
    allergies: 'None known',
    currentMedications: 'None',
  },
  {
    key: 'patient.hasan',
    fullName: 'Hasan Mroue',
    phone: '+963933200002',
    age: 41,
    gender: 'Male',
    isWalkin: false,
    medicalHistory: 'Type 2 diabetes, HbA1c 7.4%. Diagnosed 6 years ago.',
    allergies: 'Penicillin — urticarial rash',
    currentMedications: 'Metformin 1000 mg twice daily',
  },
  {
    key: 'patient.rana',
    fullName: 'Rana Sleiman',
    phone: '+963933200003',
    age: 34,
    gender: 'Female',
    isWalkin: false,
    medicalHistory: 'Hypothyroidism, stable. Two previous pregnancies.',
    allergies: 'None known',
    currentMedications: 'Levothyroxine 75 mcg daily',
  },
  {
    key: 'patient.jad',
    fullName: 'Jad Othman',
    phone: '+963933200004',
    age: 26,
    gender: 'Male',
    isWalkin: false,
    medicalHistory: 'Healthy. Heavy smoker, 15 cigarettes/day.',
    allergies: 'None known',
    currentMedications: 'None',
  },
  {
    key: 'patient.mona',
    fullName: 'Mona Zaher',
    phone: '+963933200005',
    age: 52,
    gender: 'Female',
    isWalkin: false,
    medicalHistory: 'Hypertension controlled on medication. Dental anxiety.',
    allergies: 'Latex — contact dermatitis',
    currentMedications: 'Amlodipine 5 mg daily',
  },
  {
    key: 'patient.fadi',
    fullName: 'Fadi Kanaan',
    phone: '+963933200006',
    age: 47,
    gender: 'Male',
    isWalkin: true,
    medicalHistory:
      'Chronic periodontitis with generalised bone loss. Irregular attender.',
    allergies: 'None known',
    currentMedications: 'None',
  },
  {
    key: 'patient.leen',
    fullName: 'Leen Abboud',
    phone: '+963933200007',
    age: 22,
    gender: 'Female',
    isWalkin: false,
    medicalHistory: 'Healthy. Orthodontic treatment completed two years ago.',
    allergies: 'None known',
    currentMedications: 'None',
  },
  {
    key: 'patient.tarek',
    fullName: 'Tarek Fahim',
    phone: '+963933200008',
    age: 63,
    gender: 'Male',
    isWalkin: false,
    medicalHistory:
      'Atrial fibrillation. On anticoagulation — INR checked before any extraction.',
    allergies: 'None known',
    currentMedications: 'Warfarin 5 mg daily, Bisoprolol 2.5 mg daily',
  },
  {
    key: 'patient.nadia',
    fullName: 'Nadia Chaaban',
    phone: '+963933200009',
    age: 38,
    gender: 'Female',
    isWalkin: false,
    medicalHistory: 'Iron deficiency anaemia, treated. Otherwise healthy.',
    allergies: 'Ibuprofen — gastric intolerance',
    currentMedications: 'Ferrous sulphate 200 mg daily',
  },
  {
    key: 'patient.ghassan',
    fullName: 'Ghassan Rifai',
    phone: '+963933200010',
    age: 58,
    gender: 'Male',
    isWalkin: false,
    medicalHistory:
      'Osteoporosis treated with oral bisphosphonates for 4 years. MRONJ risk noted.',
    allergies: 'None known',
    currentMedications: 'Alendronate 70 mg weekly, Vitamin D',
  },
];
