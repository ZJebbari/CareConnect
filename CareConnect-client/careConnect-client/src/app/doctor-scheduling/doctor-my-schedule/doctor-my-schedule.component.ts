import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmationDialogComponent } from '../../reusables/confirmation-dialog/confirmation-dialog.component';
import { ScheduleBlockDialogComponent, ScheduleBlockDialogResult } from '../schedule-block-dialog/schedule-block-dialog.component';
import { PhysicianScheduleResult } from '../../models/physicianScheduleResult';
import { DoctorContextService } from '../../services/doctor-context.service';
import { PhysicianScheduleUpsertRequest, SchedulingService } from '../../services/scheduling.service';
import { SchedulingSocketService } from '../../services/scheduling-socket.service';
import { UiFeedbackService } from '../../services/ui-feedback.service';

interface ScheduleGroup {
  dayLabel: string;
  schedules: PhysicianScheduleResult[];
}

@Component({
  selector: 'app-doctor-my-schedule',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatExpansionModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './doctor-my-schedule.component.html',
  styleUrl: './doctor-my-schedule.component.scss',
})
export class DoctorMyScheduleComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly doctorContext = inject(DoctorContextService);
  private readonly feedback = inject(UiFeedbackService);
  private readonly schedulingApi = inject(SchedulingService);
  private readonly schedulingSocket = inject(SchedulingSocketService);

  protected readonly loading = signal(false);
  protected readonly schedules = signal<PhysicianScheduleResult[]>([]);
  protected readonly feedbackMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly physicianProfileId = computed(() =>
    this.doctorContext.physicianProfileId()
  );
  protected readonly contextResolving = computed(() => this.doctorContext.isResolving());
  protected readonly contextError = computed(() => this.doctorContext.resolveError());
  protected readonly coveredWeekdayCount = computed(() => {
    return new Set(
      this.schedules()
        .filter((schedule) => schedule.isActive)
        .map((schedule) => schedule.dayOfWeek)
    ).size;
  });
  protected readonly weeklyCoverageMessage = computed(() => {
    const coveredDays = this.coveredWeekdayCount();

    if (coveredDays === 7) {
      return 'You have weekly availability configured for all 7 weekdays.';
    }

    return `You have availability configured for ${coveredDays} of 7 weekdays.`;
  });
  protected readonly groupedSchedules = computed<ScheduleGroup[]>(() => {
    const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return dayLabels.map((dayLabel, index) => ({
      dayLabel,
      schedules: this.schedules().filter((schedule) => schedule.dayOfWeek === index + 1),
    }));
  });

  constructor() {
    this.doctorContext.ensureCurrentDoctorLoaded();

    effect(() => {
      const physicianId = this.physicianProfileId();

      if (physicianId === null) {
        this.schedules.set([]);
        return;
      }

      this.loadSchedules();
    });

    effect(() => {
      const refreshRequest = this.schedulingSocket.calendarRefreshRequest();
      const physicianId = this.physicianProfileId();

      if (
        !refreshRequest ||
        physicianId === null ||
        refreshRequest.reason !== 'PhysicianScheduleUpdated'
      ) {
        return;
      }

      if (refreshRequest.physicianId === null || refreshRequest.physicianId === physicianId) {
        this.loadSchedules();
      }
    });
  }

  protected retryResolveDoctor() {
    this.doctorContext.ensureCurrentDoctorLoaded(true);
  }

  protected openCreateDialog() {
    const dialogRef = this.dialog.open(ScheduleBlockDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      data: { mode: 'create' },
    });

    dialogRef.afterClosed().subscribe((result: ScheduleBlockDialogResult | undefined) => {
      if (!result) {
        return;
      }

      this.createSchedulesForWeekdays(result);
    });
  }

  protected openEditDialog(schedule: PhysicianScheduleResult) {
    const dialogRef = this.dialog.open(ScheduleBlockDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      data: { mode: 'edit', schedule },
    });

    dialogRef.afterClosed().subscribe((result: ScheduleBlockDialogResult | undefined) => {
      if (!result) {
        return;
      }

      this.updateScheduleWithWeekdayDuplication(schedule, result);
    });
  }

  protected deleteSchedule(schedule: PhysicianScheduleResult) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: schedule.isActive ? 'Delete Schedule Block' : 'Remove Schedule Block',
        bodyText: `Delete the ${schedule.startTime} - ${schedule.endTime} block on ${this.dayLabelFor(schedule.dayOfWeek)}?`,
        confirmText: schedule.isActive ? 'Delete Block' : 'Remove Block',
        cancelText: 'Keep Block',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.schedulingApi.deleteCurrentDoctorSchedule(schedule.physicianScheduleId).subscribe({
        next: (response) => {
          this.feedbackMessage.set(response.message);
          this.errorMessage.set(null);
          this.feedback.success(response.message);
          this.loadSchedules();
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Unable to delete the schedule block.';
          this.errorMessage.set(message);
          this.feedbackMessage.set(null);
          this.feedback.error(message);
        },
      });
    });
  }

  protected trackByDay(_index: number, group: ScheduleGroup) {
    return group.dayLabel;
  }

  protected dayLabelFor(dayOfWeek: number) {
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayOfWeek - 1] ?? 'Unknown';
  }

  protected formatTime(value: string) {
    const [hours, minutes] = value.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  protected hasIncompleteCoverage() {
    return this.coveredWeekdayCount() < 7;
  }

  private buildSchedulePayload(
    dayOfWeek: number,
    payload: Omit<PhysicianScheduleUpsertRequest, 'dayOfWeek'>
  ): PhysicianScheduleUpsertRequest {
    return {
      ...payload,
      dayOfWeek,
    };
  }

  private createSchedulesForWeekdays(result: ScheduleBlockDialogResult) {
    const createRequests = result.selectedWeekdays.map((dayOfWeek) =>
      this.schedulingApi
        .createCurrentDoctorSchedule(this.buildSchedulePayload(dayOfWeek, result.payload))
        .pipe(
          map(() => ({ success: true as const, dayOfWeek })),
          catchError((err) =>
            of({
              success: false as const,
              dayOfWeek,
              message: err?.error?.message ?? `Unable to create weekly availability for ${this.dayLabelFor(dayOfWeek)}.`,
            })
          )
        )
    );

    forkJoin(createRequests).subscribe((results) => {
      const failures = results.filter((result) => !result.success);

      if (failures.length > 0) {
        const message = failures[0].message;
        this.errorMessage.set(message);
        this.feedbackMessage.set(null);
        this.feedback.error(message);
      } else {
        const message =
          results.length === 1
            ? 'Weekly availability saved.'
            : `Weekly availability saved for ${results.length} weekdays.`;
        this.feedbackMessage.set(message);
        this.errorMessage.set(null);
        this.feedback.success(message);
      }

      this.loadSchedules();
    });
  }

  private updateScheduleWithWeekdayDuplication(
    schedule: PhysicianScheduleResult,
    result: ScheduleBlockDialogResult
  ) {
    const [primaryDay, ...additionalDays] = result.selectedWeekdays;

    this.schedulingApi
      .updateCurrentDoctorSchedule(
        schedule.physicianScheduleId,
        this.buildSchedulePayload(primaryDay, result.payload)
      )
      .subscribe({
        next: () => {
          if (additionalDays.length === 0) {
            const message = 'Weekly availability updated.';
            this.feedbackMessage.set(message);
            this.errorMessage.set(null);
            this.feedback.success(message);
            this.loadSchedules();
            return;
          }

          const duplicateRequests = additionalDays.map((dayOfWeek) =>
            this.schedulingApi
              .createCurrentDoctorSchedule(this.buildSchedulePayload(dayOfWeek, result.payload))
              .pipe(
                map(() => ({ success: true as const, dayOfWeek })),
                catchError((err) =>
                  of({
                    success: false as const,
                    dayOfWeek,
                    message:
                      err?.error?.message ??
                      `Updated the original schedule, but could not add ${this.dayLabelFor(dayOfWeek)}.`,
                  })
                )
              )
          );

          forkJoin(duplicateRequests).subscribe((duplicateResults) => {
            const failures = duplicateResults.filter((duplicate) => !duplicate.success);

            if (failures.length > 0) {
              const message = failures[0].message;
              this.errorMessage.set(message);
              this.feedbackMessage.set(null);
              this.feedback.error(message);
            } else {
              const message =
                additionalDays.length === 0
                  ? 'Weekly availability updated.'
                  : `Weekly availability updated and copied to ${additionalDays.length + 1} weekdays.`;
              this.feedbackMessage.set(message);
              this.errorMessage.set(null);
              this.feedback.success(message);
            }

            this.loadSchedules();
          });
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Unable to update the weekly availability.';
          this.errorMessage.set(message);
          this.feedbackMessage.set(null);
          this.feedback.error(message);
        },
      });
  }

  private loadSchedules() {
    if (this.physicianProfileId() === null) {
      this.schedules.set([]);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.schedulingApi
      .getCurrentDoctorSchedules(undefined, false)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (schedules) => {
          this.schedules.set(schedules);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load physician schedule:', err);
          this.schedules.set([]);
          this.errorMessage.set(
            err?.error?.message ?? 'Unable to load your schedule blocks.'
          );
          this.loading.set(false);
        },
      });
  }
}