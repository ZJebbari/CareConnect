export interface PhysicianResult {
  physicianID: number;
  userID: number;
  roleID: number;
  availability: boolean;
  specialty:string
  bio: string;
  fullName: string;
  email: string;
  phone: string;
  password: string | null;
  createdAt: Date;
}