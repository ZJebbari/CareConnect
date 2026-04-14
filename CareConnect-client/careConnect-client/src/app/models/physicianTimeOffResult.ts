export interface PhysicianTimeOffResult {
  physicianTimeOffId: number;
  physicianId: number;
  startDateTime: Date;
  endDateTime: Date;
  isAllDay: boolean;
  reason: string | null;
  notes: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}