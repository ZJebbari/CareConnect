export interface CurrentDoctorResult {
  physicianId: number;
  userId: number;
  availability: boolean | null;
  specialtyId: number | null;
  bio: string | null;
}