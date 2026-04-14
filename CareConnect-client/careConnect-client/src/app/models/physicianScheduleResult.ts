export interface PhysicianScheduleResult {
  physicianScheduleId: number;
  physicianId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  effectiveStartDate: Date;
  effectiveEndDate: Date | null;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}