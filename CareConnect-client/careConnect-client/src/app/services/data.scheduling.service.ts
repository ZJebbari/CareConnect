import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PhysicianScheduleResult } from '../models/physicianScheduleResult';
import { PhysicianTimeOffResult } from '../models/physicianTimeOffResult';
import { SchedulingService } from './scheduling.service';
import { SchedulingSocketService } from './scheduling-socket.service';

@Injectable({
  providedIn: 'root',
})
export class dataSchedulingService {
  private readonly api = inject(SchedulingService);
  private readonly socket = inject(SchedulingSocketService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly selectedPhysicianId = signal<number | null>(null);
  private readonly selectedDate = signal<Date | null>(null);

  private readonly physicianSchedules = signal<PhysicianScheduleResult[]>([]);
  public readonly physicianScheduleData = computed(() => this.physicianSchedules());

  private readonly physicianTimeOff = signal<PhysicianTimeOffResult[]>([]);
  public readonly physicianTimeOffData = computed(() => this.physicianTimeOff());

  private readonly availableSlots = signal<Date[]>([]);
  public readonly availableSlotData = computed(() => this.availableSlots());

  private readonly refreshing = signal(false);
  public readonly isRefreshing = computed(() => this.refreshing());

  constructor() {
    effect(() => {
      const physicianId = this.selectedPhysicianId();
      const selectedDate = this.selectedDate();

      if (physicianId === null || selectedDate === null) {
        return;
      }

      this.refreshCalendarData(physicianId, selectedDate);
    });

    effect(() => {
      const refreshRequest = this.socket.calendarRefreshRequest();
      const physicianId = this.selectedPhysicianId();
      const selectedDate = this.selectedDate();

      if (!refreshRequest || physicianId === null || selectedDate === null) {
        return;
      }

      const matchesPhysician =
        refreshRequest.physicianId === null || refreshRequest.physicianId === physicianId;

      const matchesDate =
        refreshRequest.date === null || this.isSameDay(selectedDate, refreshRequest.date);

      if (matchesPhysician && matchesDate) {
        this.refreshCalendarData(physicianId, selectedDate);
      }

      this.socket.clearCalendarRefreshRequest();
    });
  }

  public setCalendarContext(physicianId: number, date: Date) {
    this.selectedPhysicianId.set(physicianId);
    this.selectedDate.set(date);
  }

  public clearCalendarContext() {
    this.selectedPhysicianId.set(null);
    this.selectedDate.set(null);
    this.physicianSchedules.set([]);
    this.physicianTimeOff.set([]);
    this.availableSlots.set([]);
  }

  public refreshCurrentCalendarData() {
    const physicianId = this.selectedPhysicianId();
    const selectedDate = this.selectedDate();

    if (physicianId === null || selectedDate === null) {
      return;
    }

    this.refreshCalendarData(physicianId, selectedDate);
  }

  private refreshCalendarData(physicianId: number, date: Date) {
    this.refreshing.set(true);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    forkJoin({
      schedules: this.api.getPhysicianSchedules(physicianId, startOfDay, true),
      timeOff: this.api.getPhysicianTimeOff(physicianId, startOfDay, endOfDay),
      availableSlots: this.api.getAvailableAppointmentSlots(physicianId, startOfDay),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ schedules, timeOff, availableSlots }) => {
          this.physicianSchedules.set(schedules);
          this.physicianTimeOff.set(timeOff);
          this.availableSlots.set(
            availableSlots.map((slot) => new Date(slot))
          );
          this.refreshing.set(false);
          this.socket.clearAppointmentCreated();
          this.socket.clearAppointmentUpdated();
          this.socket.clearAppointmentCancelled();
          this.socket.clearPhysicianScheduleUpdated();
          this.socket.clearPhysicianTimeOffUpdated();
        },
        error: (err) => {
          console.error('Failed to refresh scheduling calendar data:', err);
          this.refreshing.set(false);
        },
      });
  }

  private isSameDay(left: Date, right: Date): boolean {
    return (
      left.getFullYear() === right.getFullYear() &&
      left.getMonth() === right.getMonth() &&
      left.getDate() === right.getDate()
    );
  }
}