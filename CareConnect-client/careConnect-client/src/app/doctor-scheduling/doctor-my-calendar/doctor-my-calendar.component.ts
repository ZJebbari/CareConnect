import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DoctorContextService } from '../../services/doctor-context.service';
import { dataSchedulingService } from '../../services/data.scheduling.service';

@Component({
  selector: 'app-doctor-my-calendar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDividerModule,
    MatIconModule,
    MatListModule,
    MatNativeDateModule,
    MatTooltipModule,
  ],
  templateUrl: './doctor-my-calendar.component.html',
  styleUrl: './doctor-my-calendar.component.scss',
})
export class DoctorMyCalendarComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly doctorContext = inject(DoctorContextService);
  protected readonly schedulingData = inject(dataSchedulingService);

  protected readonly selectedDate = signal(new Date());
  protected readonly physicianProfileId = computed(() =>
    this.doctorContext.physicianProfileId()
  );
  protected readonly contextResolving = computed(() => this.doctorContext.isResolving());
  protected readonly contextError = computed(() => this.doctorContext.resolveError());
  protected readonly availableSlots = computed(() =>
    this.schedulingData.availableSlotData()
  );
  protected readonly timeOffEntries = computed(() =>
    this.schedulingData.physicianTimeOffData()
  );
  protected readonly daySchedules = computed(() =>
    this.schedulingData.physicianScheduleData()
  );
  protected readonly isRefreshing = computed(() =>
    this.schedulingData.isRefreshing()
  );
  protected readonly finalAvailabilitySummary = computed(() => {
    const schedules = this.daySchedules();
    const timeOffEntries = this.timeOffEntries();
    const availableSlots = this.availableSlots();

    if (schedules.length === 0) {
      return {
        title: 'No weekly clinic hours configured',
        detail: 'This selected date has no recurring weekly availability to open for booking.',
        tone: 'neutral',
      };
    }

    if (availableSlots.length === 0 && timeOffEntries.length > 0) {
      return {
        title: 'Unavailable after override',
        detail: 'A time-off exception removes all bookable coverage for this selected date.',
        tone: 'blocked',
      };
    }

    if (availableSlots.length === 0) {
      return {
        title: 'No open booking slots remain',
        detail: 'Recurring hours exist for this weekday, but there are no remaining computed slots for the selected date.',
        tone: 'blocked',
      };
    }

    const firstSlot = this.formatDateTime(availableSlots[0]);
    const lastSlot = this.formatDateTime(availableSlots[availableSlots.length - 1]);

    if (timeOffEntries.length > 0) {
      return {
        title: 'Partially available after override',
        detail: `${availableSlots.length} final slot(s) remain, from ${firstSlot} through ${lastSlot}.`,
        tone: 'caution',
      };
    }

    return {
      title: 'Open for booking',
      detail: `${availableSlots.length} final slot(s) are bookable, from ${firstSlot} through ${lastSlot}.`,
      tone: 'ready',
    };
  });

  constructor() {
    this.doctorContext.ensureCurrentDoctorLoaded();

    effect(() => {
      const physicianId = this.physicianProfileId();
      const selectedDate = this.selectedDate();

      if (physicianId === null) {
        this.schedulingData.clearCalendarContext();
        return;
      }

      this.schedulingData.setCalendarContext(physicianId, selectedDate);
    });

    this.destroyRef.onDestroy(() => {
      this.schedulingData.clearCalendarContext();
    });
  }

  protected retryResolveDoctor() {
    this.doctorContext.ensureCurrentDoctorLoaded(true);
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

  protected formatDateTime(value: Date) {
    return value.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  protected updateSelectedDate(date: Date | null) {
    if (!date) {
      return;
    }

    this.selectedDate.set(date);
  }
}