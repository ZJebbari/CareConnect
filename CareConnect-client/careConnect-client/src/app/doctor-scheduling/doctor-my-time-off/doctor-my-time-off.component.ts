import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmationDialogComponent } from '../../reusables/confirmation-dialog/confirmation-dialog.component';
import { TimeOffDialogComponent } from '../time-off-dialog/time-off-dialog.component';
import { PhysicianTimeOffResult } from '../../models/physicianTimeOffResult';
import { DoctorContextService } from '../../services/doctor-context.service';
import { SchedulingService } from '../../services/scheduling.service';
import { SchedulingSocketService } from '../../services/scheduling-socket.service';
import { UiFeedbackService } from '../../services/ui-feedback.service';

@Component({
  selector: 'app-doctor-my-time-off',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './doctor-my-time-off.component.html',
  styleUrl: './doctor-my-time-off.component.scss',
})
export class DoctorMyTimeOffComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly doctorContext = inject(DoctorContextService);
  private readonly feedback = inject(UiFeedbackService);
  private readonly schedulingApi = inject(SchedulingService);
  private readonly schedulingSocket = inject(SchedulingSocketService);

  protected readonly loading = signal(false);
  protected readonly timeOffEntries = signal<PhysicianTimeOffResult[]>([]);
  protected readonly feedbackMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly physicianProfileId = computed(() =>
    this.doctorContext.physicianProfileId()
  );
  protected readonly contextResolving = computed(() => this.doctorContext.isResolving());
  protected readonly contextError = computed(() => this.doctorContext.resolveError());
  protected readonly upcomingEntries = computed(() => {
    const now = new Date().getTime();
    return this.timeOffEntries()
      .filter((entry) => new Date(entry.endDateTime).getTime() >= now)
      .sort(
        (left, right) =>
          new Date(left.startDateTime).getTime() - new Date(right.startDateTime).getTime()
      );
  });

  constructor() {
    this.doctorContext.ensureCurrentDoctorLoaded();

    effect(() => {
      const physicianId = this.physicianProfileId();

      if (physicianId === null) {
        this.timeOffEntries.set([]);
        return;
      }

      this.loadTimeOff();
    });

    effect(() => {
      const refreshRequest = this.schedulingSocket.calendarRefreshRequest();
      const physicianId = this.physicianProfileId();

      if (
        !refreshRequest ||
        physicianId === null ||
        refreshRequest.reason !== 'PhysicianTimeOffUpdated'
      ) {
        return;
      }

      if (refreshRequest.physicianId === null || refreshRequest.physicianId === physicianId) {
        this.loadTimeOff();
      }
    });
  }

  protected retryResolveDoctor() {
    this.doctorContext.ensureCurrentDoctorLoaded(true);
  }

  protected openCreateDialog() {
    const dialogRef = this.dialog.open(TimeOffDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      data: { mode: 'create' },
    });

    dialogRef.afterClosed().subscribe((payload) => {
      if (!payload) {
        return;
      }

      this.schedulingApi.createCurrentDoctorTimeOff(payload).subscribe({
        next: (response) => {
          this.feedbackMessage.set(response.message);
          this.errorMessage.set(null);
          this.feedback.success(response.message);
          this.loadTimeOff();
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Unable to create the time off request.';
          this.errorMessage.set(message);
          this.feedbackMessage.set(null);
          this.feedback.error(message);
        },
      });
    });
  }

  protected openEditDialog(entry: PhysicianTimeOffResult) {
    const dialogRef = this.dialog.open(TimeOffDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      data: { mode: 'edit', entry },
    });

    dialogRef.afterClosed().subscribe((payload) => {
      if (!payload) {
        return;
      }

      this.schedulingApi
        .updateCurrentDoctorTimeOff(entry.physicianTimeOffId, payload)
        .subscribe({
          next: (response) => {
            this.feedbackMessage.set(response.message);
            this.errorMessage.set(null);
            this.feedback.success(response.message);
            this.loadTimeOff();
          },
          error: (err) => {
            const message = err?.error?.message ?? 'Unable to update the time off request.';
            this.errorMessage.set(message);
            this.feedbackMessage.set(null);
            this.feedback.error(message);
          },
        });
    });
  }

  protected deleteTimeOff(entry: PhysicianTimeOffResult) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Cancel Time Off',
        bodyText: `Cancel the ${entry.reason || 'time off'} block starting ${new Date(entry.startDateTime).toLocaleString()}?`,
        confirmText: 'Cancel Request',
        cancelText: 'Keep Request',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.schedulingApi.deleteCurrentDoctorTimeOff(entry.physicianTimeOffId).subscribe({
        next: (response) => {
          this.feedbackMessage.set(response.message);
          this.errorMessage.set(null);
          this.feedback.success(response.message);
          this.loadTimeOff();
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Unable to cancel the time off request.';
          this.errorMessage.set(message);
          this.feedbackMessage.set(null);
          this.feedback.error(message);
        },
      });
    });
  }

  private loadTimeOff() {
    if (this.physicianProfileId() === null) {
      this.timeOffEntries.set([]);
      return;
    }

    const rangeStart = new Date();
    const rangeEnd = new Date();
    rangeEnd.setMonth(rangeEnd.getMonth() + 6);

    this.loading.set(true);
    this.errorMessage.set(null);
    this.schedulingApi
      .getCurrentDoctorTimeOff(rangeStart, rangeEnd)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (entries) => {
          this.timeOffEntries.set(entries);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load physician time off:', err);
          this.timeOffEntries.set([]);
          this.errorMessage.set(
            err?.error?.message ?? 'Unable to load your time off requests.'
          );
          this.loading.set(false);
        },
      });
  }
}