export interface Medication {
  name: string;
  dose: string;
  route: string;
  frequency: string;
  status: string;
  reason_or_note: string;
}

export interface PharmacyFocus {
  medications: Medication[];
  adherence: string;
  side_effects: string[];
  drug_related_problems: string[];
  labs_and_monitoring: string[];
  patient_education: string[];
  follow_up: string;
}

export interface Soap {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface Alerts {
  red_flags: string[];
  need_to_contact_physician: string[];
}

export interface Meta {
  main_problems: string[];
  note_for_pharmacy: string;
}

export interface ClinicalData {
  soap: Soap;
  pharmacy_focus: PharmacyFocus;
  alerts: Alerts;
  meta: Meta;
}

export interface Record {
  id: string;
  date: string;
  transcript: string;
  clinicalData: ClinicalData;
  status: 'approved' | 'pending';
}

export interface Patient {
  id: string;
  name: string;
  kana: string;
  birthDate: string; // YYYY-MM-DD
  age: number;
  gender: 'male' | 'female';
  avatarColor: string;
  records: Record[];
}