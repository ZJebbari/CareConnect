import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, map, of } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { dataAdminService } from '../../services/data.admin.service';
import { ConfirmationDialogComponent } from '../../reusables/confirmation-dialog/confirmation-dialog.component';
import {
  AdminPhysicianSchedulePayload,
  AdminPhysicianTimeOffPayload,
  AdminService,
} from '../../services/admin.service';
import { Helper } from '../../helper/helper';
import { UiFeedbackService } from '../../services/ui-feedback.service';
import { PhysicianScheduleResult } from '../../models/physicianScheduleResult';
import { PhysicianTimeOffResult } from '../../models/physicianTimeOffResult';
import {
  ScheduleBlockDialogComponent,
  ScheduleBlockDialogResult,
} from '../../doctor-scheduling/schedule-block-dialog/schedule-block-dialog.component';
import { TimeOffDialogComponent } from '../../doctor-scheduling/time-off-dialog/time-off-dialog.component';

@Component({
  selector: 'app-physician-details',
  imports: [
    MatFormFieldModule,
    FormsModule,
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatIconModule,
    MatChipsModule,
  ],
  templateUrl: './physician-details.component.html',
  styleUrl: './physician-details.component.scss'
})
export class PhysicianDetailsComponent {
  // Input properties from parent
  public physicianId = input<number>(0);
  public userId = input<number>(0);
  public fullNameInput = input<string | null>(null);
  public specialtyInput = input<string | null>(null);
  public emailInput = input<string | null>(null);
  public phoneInput = input<string | null>(null);
  public availabilityInput = input<boolean>(false);
  public bioInput = input<string | null>(null);

  // Form state signals
  public fullName = signal<string>('');
  public specialty = signal<string>('');
  public email = signal<string>('');
  public phone = signal<string>('');
  public availability = signal<boolean>(false);
  public bio = signal<string>('');
  public loadingSchedules = signal(false);
  public loadingTimeOff = signal(false);
  public physicianSchedules = signal<PhysicianScheduleResult[]>([]);
  public physicianTimeOff = signal<PhysicianTimeOffResult[]>([]);
  public schedulingError = signal<string | null>(null);
  public timeOffError = signal<string | null>(null);

  private original = signal({
    fullName: '',
    specialty: '',
    phone: '',
    email: '',
    availability: false,
    bio: '',
  });

  public physicianPayload = computed(() => ({
    userId: this.userId() ?? 0,
    fullName: (this.fullName() ?? '').trim(),
    specialty: (this.specialty() ?? '').trim(),
    specialtyID: this.resolveSpecialtyId((this.specialty() ?? '').trim()),
    phone: (this.phone() ?? '').trim(),
    email: (this.email() ?? '').trim(),
    password: null,
    availability: this.availability(),
    bio: (this.bio() ?? '').trim(),
  }));

  public specialties = computed(() => this.dataService.specialtyData());
  public groupedSchedules = computed(() => {
    const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return dayLabels.map((dayLabel, index) => ({
      dayLabel,
      schedules: this.physicianSchedules().filter((schedule) => schedule.dayOfWeek === index + 1),
    }));
  });
  public sortedTimeOff = computed(() => {
    return [...this.physicianTimeOff()].sort(
      (left, right) =>
        new Date(left.startDateTime).getTime() - new Date(right.startDateTime).getTime()
    );
  });

  private dialog = inject(MatDialog);
  private feedback = inject(UiFeedbackService);
  
  constructor(private dataService: dataAdminService, private _adminService: AdminService){
    // Initialize form signals from inputs and set original values
    effect(() => {
      const userId = this.userId();
      const fullNameInput = this.fullNameInput();
      const specialtyInput = this.specialtyInput();
      const emailInput = this.emailInput();
      const phoneInput = this.phoneInput();
      const availabilityInput = this.availabilityInput();
      const bioInput = this.bioInput();

      if (userId && fullNameInput) {
        this.fullName.set(fullNameInput);
        this.specialty.set(specialtyInput || '');
        this.email.set(emailInput || '');
        this.phone.set(phoneInput || '');
        this.availability.set(availabilityInput);
        this.bio.set(bioInput || '');

        this.original.set({
          fullName: fullNameInput,
          specialty: specialtyInput || '',
          phone: phoneInput || '',
          email: emailInput || '',
          availability: availabilityInput,
          bio: bioInput || '',
        });

        this.loadSchedulingData();
      }
    });
  }

  public isDirty(): boolean {
    return (
      (this.fullName()?.trim().length ?? 0) > 0 &&
      (this.fullName()?.trim() !== (this.original().fullName ?? '').trim()) ||
      (this.specialty() ?? '').trim() !== (this.original().specialty ?? '').trim() ||
      (this.email()?.trim().length ?? 0) > 0 &&
      (this.email()?.trim() !== (this.original().email ?? '').trim()) ||
      (this.phone()?.trim().length ?? 0) > 0 &&
      (this.phone()?.trim() !== (this.original().phone ?? '').trim()) ||
      this.availability() !== this.original().availability ||
      (this.bio()?.trim().length ?? 0) > 0 &&
      (this.bio()?.trim() !== (this.original().bio ?? '').trim())
    );
  }

  public deletePhysician(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Physician',
        bodyText: `Are you sure you want to delete physician ${this.fullName()}?`,
        confirmText: 'YES, DELETE',
        cancelText: 'NO, CANCEL'
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && this.userId()) {
        this._adminService.deletePhysician(this.userId()).subscribe({
          next: () => {
            console.log('Physician Deleted');
          },
          error: (err) => {
            console.log("Delete failed", err);
          }
        });
      }
    });
  }

  public updatePhysician(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Update Physician',
        bodyText: 'Are you sure you want to update?',
        confirmText: 'YES, UPDATE',
        cancelText: 'NO, CANCEL',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      const userId = this.userId();
      if (confirmed && userId) {
        const payload = this.physicianPayload();
        const sanitized = { ...payload, phone: Helper.PhoneNumber(payload.phone) };

        this._adminService.updatePhysician(sanitized).subscribe({
          next: () => {
            console.log('Physician updated');
            this.original.set({ ...payload });
          },
          error: (err) => {
            console.log('Update failed', err);
          }
        });
      }
    });
  }

  public openCreateScheduleDialog(): void {
    const physicianId = this.physicianId();
    if (!physicianId) {
      return;
    }

    const dialogRef = this.dialog.open(ScheduleBlockDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      data: { mode: 'create' },
    });

    dialogRef.afterClosed().subscribe((result: ScheduleBlockDialogResult | undefined) => {
      if (!result) {
        return;
      }

      this.createSchedulesForWeekdays(physicianId, result);
    });
  }

  public openEditScheduleDialog(schedule: PhysicianScheduleResult): void {
    const physicianId = this.physicianId();
    if (!physicianId) {
      return;
    }

    const dialogRef = this.dialog.open(ScheduleBlockDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      data: { mode: 'edit', schedule },
    });

    dialogRef.afterClosed().subscribe((result: ScheduleBlockDialogResult | undefined) => {
      if (!result) {
        return;
      }

      this.updateScheduleWithWeekdayDuplication(physicianId, schedule, result);
    });
  }

  public toggleScheduleActive(schedule: PhysicianScheduleResult, isActive: boolean): void {
    const physicianId = this.physicianId();
    if (!physicianId) {
      return;
    }

    this._adminService
      .updatePhysicianSchedule(schedule.physicianScheduleId, {
        physicianId,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        slotDurationMinutes: schedule.slotDurationMinutes,
        effectiveStartDate: this.toDateInput(schedule.effectiveStartDate),
        effectiveEndDate: schedule.effectiveEndDate
          ? this.toDateInput(schedule.effectiveEndDate)
          : null,
        isActive,
      })
      .subscribe({
        next: (response) => {
          this.feedback.success(response.message);
          this.schedulingError.set(null);
          this.loadSchedules();
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Unable to update physician availability.';
          this.schedulingError.set(message);
          this.feedback.error(message);
        },
      });
  }

  public deleteSchedule(schedule: PhysicianScheduleResult): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Weekly Availability',
        bodyText: `Delete the ${this.dayLabelFor(schedule.dayOfWeek)} ${this.formatTime(schedule.startTime)} - ${this.formatTime(schedule.endTime)} block?`,
        confirmText: 'DELETE',
        cancelText: 'CANCEL',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this._adminService.deletePhysicianSchedule(schedule.physicianScheduleId).subscribe({
        next: (response) => {
          this.feedback.success(response.message);
          this.schedulingError.set(null);
          this.loadSchedules();
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Unable to delete weekly availability.';
          this.schedulingError.set(message);
          this.feedback.error(message);
        },
      });
    });
  }

  public openCreateTimeOffDialog(): void {
    const physicianId = this.physicianId();
    if (!physicianId) {
      return;
    }

    const dialogRef = this.dialog.open(TimeOffDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      data: { mode: 'create' },
    });

    dialogRef.afterClosed().subscribe((payload: Omit<AdminPhysicianTimeOffPayload, 'physicianId'> | undefined) => {
      if (!payload) {
        return;
      }

      this._adminService
        .createPhysicianTimeOff({ physicianId, ...payload })
        .subscribe({
          next: (response) => {
            this.feedback.success(response.message);
            this.timeOffError.set(null);
            this.loadTimeOff();
          },
          error: (err) => {
            const message = err?.error?.message ?? 'Unable to create time off.';
            this.timeOffError.set(message);
            this.feedback.error(message);
          },
        });
    });
  }

  public openEditTimeOffDialog(entry: PhysicianTimeOffResult): void {
    const physicianId = this.physicianId();
    if (!physicianId) {
      return;
    }

    const dialogRef = this.dialog.open(TimeOffDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      data: { mode: 'edit', entry },
    });

    dialogRef.afterClosed().subscribe((payload: Omit<AdminPhysicianTimeOffPayload, 'physicianId'> | undefined) => {
      if (!payload) {
        return;
      }

      this._adminService
        .updatePhysicianTimeOff(entry.physicianTimeOffId, { physicianId, ...payload })
        .subscribe({
          next: (response) => {
            this.feedback.success(response.message);
            this.timeOffError.set(null);
            this.loadTimeOff();
          },
          error: (err) => {
            const message = err?.error?.message ?? 'Unable to update time off.';
            this.timeOffError.set(message);
            this.feedback.error(message);
          },
        });
    });
  }

  public deleteTimeOff(entry: PhysicianTimeOffResult): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Time Off',
        bodyText: `Delete the override starting ${new Date(entry.startDateTime).toLocaleString()}?`,
        confirmText: 'DELETE',
        cancelText: 'CANCEL',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this._adminService.deletePhysicianTimeOff(entry.physicianTimeOffId).subscribe({
        next: (response) => {
          this.feedback.success(response.message);
          this.timeOffError.set(null);
          this.loadTimeOff();
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Unable to delete time off.';
          this.timeOffError.set(message);
          this.feedback.error(message);
        },
      });
    });
  }

  public dayLabelFor(dayOfWeek: number): string {
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayOfWeek - 1] ?? 'Unknown';
  }

  public formatTime(value: string): string {
    const [hours, minutes] = value.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  private resolveSpecialtyId(specialty: string): number | null {
    const match = this.specialties().find(
      (s) => s.specialty.toLowerCase() === specialty.toLowerCase()
    );

    return match?.specialtyID ?? null;
  }

  private buildSchedulePayload(
    physicianId: number,
    dayOfWeek: number,
    payload: Omit<AdminPhysicianSchedulePayload, 'physicianId' | 'dayOfWeek'>
  ): AdminPhysicianSchedulePayload {
    return {
      physicianId,
      dayOfWeek,
      ...payload,
    };
  }

  private createSchedulesForWeekdays(physicianId: number, result: ScheduleBlockDialogResult): void {
    const requests = result.selectedWeekdays.map((dayOfWeek) =>
      this._adminService
        .createPhysicianSchedule(this.buildSchedulePayload(physicianId, dayOfWeek, result.payload))
        .pipe(
          map(() => ({ success: true as const, dayOfWeek })),
          catchError((err) =>
            of({
              success: false as const,
              dayOfWeek,
              message:
                err?.error?.message ?? `Unable to add weekly availability for ${this.dayLabelFor(dayOfWeek)}.`,
            })
          )
        )
    );

    forkJoin(requests).subscribe((results) => {
      const failures = results.filter((result) => !result.success);

      if (failures.length > 0) {
        const message = failures[0].message;
        this.schedulingError.set(message);
        this.feedback.error(message);
      } else {
        const message =
          results.length === 1
            ? 'Weekly availability saved.'
            : `Weekly availability saved for ${results.length} weekdays.`;
        this.schedulingError.set(null);
        this.feedback.success(message);
      }

      this.loadSchedules();
    });
  }

  private updateScheduleWithWeekdayDuplication(
    physicianId: number,
    schedule: PhysicianScheduleResult,
    result: ScheduleBlockDialogResult
  ): void {
    const [primaryDay, ...additionalDays] = result.selectedWeekdays;

    this._adminService
      .updatePhysicianSchedule(
        schedule.physicianScheduleId,
        this.buildSchedulePayload(physicianId, primaryDay, result.payload)
      )
      .subscribe({
        next: () => {
          if (additionalDays.length === 0) {
            this.schedulingError.set(null);
            this.feedback.success('Weekly availability updated.');
            this.loadSchedules();
            return;
          }

          const duplicateRequests = additionalDays.map((dayOfWeek) =>
            this._adminService
              .createPhysicianSchedule(this.buildSchedulePayload(physicianId, dayOfWeek, result.payload))
              .pipe(
                map(() => ({ success: true as const, dayOfWeek })),
                catchError((err) =>
                  of({
                    success: false as const,
                    dayOfWeek,
                    message:
                      err?.error?.message ??
                      `Updated the original block, but could not add ${this.dayLabelFor(dayOfWeek)}.`,
                  })
                )
              )
          );

          forkJoin(duplicateRequests).subscribe((results) => {
            const failures = results.filter((result) => !result.success);

            if (failures.length > 0) {
              const message = failures[0].message;
              this.schedulingError.set(message);
              this.feedback.error(message);
            } else {
              this.schedulingError.set(null);
              this.feedback.success(
                `Weekly availability updated and copied to ${additionalDays.length + 1} weekdays.`
              );
            }

            this.loadSchedules();
          });
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Unable to update weekly availability.';
          this.schedulingError.set(message);
          this.feedback.error(message);
        },
      });
  }

  private loadSchedulingData(): void {
    this.loadSchedules();
    this.loadTimeOff();
  }

  private loadSchedules(): void {
    const physicianId = this.physicianId();
    if (!physicianId) {
      this.physicianSchedules.set([]);
      return;
    }

    this.loadingSchedules.set(true);
    this._adminService.getPhysicianSchedules(physicianId).subscribe({
      next: (schedules) => {
        this.physicianSchedules.set(schedules);
        this.loadingSchedules.set(false);
      },
      error: (err) => {
        this.schedulingError.set(
          err?.error?.message ?? 'Unable to load physician weekly availability.'
        );
        this.physicianSchedules.set([]);
        this.loadingSchedules.set(false);
      },
    });
  }

  private loadTimeOff(): void {
    const physicianId = this.physicianId();
    if (!physicianId) {
      this.physicianTimeOff.set([]);
      return;
    }

    this.loadingTimeOff.set(true);
    this._adminService.getPhysicianTimeOff(physicianId).subscribe({
      next: (entries) => {
        this.physicianTimeOff.set(entries);
        this.loadingTimeOff.set(false);
      },
      error: (err) => {
        this.timeOffError.set(
          err?.error?.message ?? 'Unable to load physician time off entries.'
        );
        this.physicianTimeOff.set([]);
        this.loadingTimeOff.set(false);
      },
    });
  }

  private toDateInput(value: Date | string): string {
    return new Date(value).toISOString().slice(0, 10);
  }
}
