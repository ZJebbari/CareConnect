export interface PhysicianResult {
  physicianId: number;
  userId: number;
  roleId: number;
  availability: boolean;
  specialty:string
  bio: string;
  fullName: string;
  email: string;
  phone: string;
  password: string | null;
  createdAt: Date;
}