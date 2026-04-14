export interface PhysicianDto {
  userId: number;
  fullName: string;
  specialty: string;
  specialtyID: number | null;
  email: string;
  password: string | null;
  phone: string;
  availability: boolean;
  bio: string;
}