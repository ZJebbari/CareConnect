export interface PatientResult {
  patiendID: number;
  userID: number;
  roleID: number;
  dateOfBirth: Date;
  address: string;
  gender: string;
  fullName: string;
  email: string;
  phone: string;
  password: string | null;
  createdAt: Date;
}
