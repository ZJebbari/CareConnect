export interface PhysicianResult {
  physicianId: number;
  userId: number;
  roleId: number;
  availability: boolean;
  specialtyID: number;
  specialty: string;
  bio: string;
  fullName: string;
  email: string;
  phone: string;
  password: string | null;
  createdAt: Date;
}