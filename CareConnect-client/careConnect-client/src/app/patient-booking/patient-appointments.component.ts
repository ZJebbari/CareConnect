import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  PatientAppointment,
  PatientBookingService,
} from '../services/patient-booking.service';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './patient-appointments.component.html',
  styleUrl: './patient-appointments.component.scss',
})
export class PatientAppointmentsComponent {
  private readonly bookingService = inject(PatientBookingService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly cancellingAppointmentId = signal<number | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly appointments = signal<PatientAppointment[]>([]);

  constructor() {
    this.loadAppointments();
  }

  protected cancelAppointment(appointment: PatientAppointment): void {
    this.cancellingAppointmentId.set(appointment.appointmentId);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.bookingService
      .cancelMyAppointment(appointment.appointmentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.cancellingAppointmentId.set(null);
          this.successMessage.set(response.message);
          this.loadAppointments();
        },
        error: (error) => {
          this.cancellingAppointmentId.set(null);
          this.errorMessage.set(error?.error?.message ?? 'Failed to cancel appointment.');
        },
      });
  }

  protected isCancelling(appointmentId: number): boolean {
    return this.cancellingAppointmentId() === appointmentId;
  }

  protected trackByAppointmentId(_index: number, appointment: PatientAppointment): number {
    return appointment.appointmentId;
  }

  private loadAppointments(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.bookingService
      .getMyUpcomingAppointments()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          this.appointments.set(response.data ?? []);
        },
        error: (error) => {
          this.loading.set(false);
          this.appointments.set([]);
          this.errorMessage.set(error?.error?.message ?? 'Failed to load appointments.');
        },
      });
  }
}