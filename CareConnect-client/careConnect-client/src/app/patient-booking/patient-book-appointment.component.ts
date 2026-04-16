import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AppointmentTypeResult } from '../models/appointmentTypeResult';
import {
  BookingPhysician,
  BookingSpecialty,
  PatientBookingService,
} from '../services/patient-booking.service';

@Component({
  selector: 'app-patient-book-appointment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    MatStepperModule,
    RouterLink,
  ],
  templateUrl: './patient-book-appointment.component.html',
  styleUrl: './patient-book-appointment.component.scss',
})
export class PatientBookAppointmentComponent {
  private readonly fb = inject(FormBuilder);
  private readonly bookingApi = inject(PatientBookingService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly today = new Date();
  protected readonly loading = signal(true);
  protected readonly loadingDoctors = signal(false);
  protected readonly loadingSlots = signal(false);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly specialties = signal<BookingSpecialty[]>([]);
  protected readonly physicians = signal<BookingPhysician[]>([]);
  protected readonly appointmentTypes = signal<AppointmentTypeResult[]>([]);
  protected readonly availableSlots = signal<string[]>([]);

  protected readonly specialtyForm = this.fb.group({
    specialtyId: this.fb.control<number | null>(null, Validators.required),
  });

  protected readonly doctorForm = this.fb.group({
    physicianId: this.fb.control<number | null>(null, Validators.required),
  });

  protected readonly slotForm = this.fb.group({
    appointmentDate: this.fb.control<Date | null>(new Date(), Validators.required),
    timeSlot: this.fb.control<string | null>(null, Validators.required),
  });

  protected readonly filteredDoctors = computed(() => {
    return this.physicians();
  });

  protected readonly selectedSpecialty = computed(() => {
    const specialtyId = this.specialtyForm.controls.specialtyId.value;
    return this.specialties().find((item) => item.specialtyId === specialtyId) ?? null;
  });

  protected readonly selectedDoctor = computed(() => {
    const physicianId = this.doctorForm.controls.physicianId.value;
    return this.filteredDoctors().find((item) => item.physicianId === physicianId) ?? null;
  });

  constructor() {
    this.loadReferenceData();

    this.specialtyForm.controls.specialtyId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.doctorForm.controls.physicianId.reset(null, { emitEvent: false });
        this.slotForm.controls.timeSlot.reset(null, { emitEvent: false });
        this.availableSlots.set([]);

        const specialtyId = this.specialtyForm.controls.specialtyId.value;
        if (specialtyId) {
          this.loadPhysiciansBySpecialty(specialtyId);
        } else {
          this.physicians.set([]);
        }
      });

    this.doctorForm.controls.physicianId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.slotForm.controls.timeSlot.reset(null, { emitEvent: false });
        this.loadSlots();
      });

    this.slotForm.controls.appointmentDate.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.slotForm.controls.timeSlot.reset(null, { emitEvent: false });
        this.loadSlots();
      });
  }

  protected selectSlot(slot: string): void {
    this.slotForm.controls.timeSlot.setValue(slot);
  }

  protected isSelectedSlot(slot: string): boolean {
    return this.slotForm.controls.timeSlot.value === slot;
  }

  protected submitBooking(): void {
    if (this.specialtyForm.invalid || this.doctorForm.invalid || this.slotForm.invalid) {
      this.specialtyForm.markAllAsTouched();
      this.doctorForm.markAllAsTouched();
      this.slotForm.markAllAsTouched();
      return;
    }

    const physicianId = this.doctorForm.controls.physicianId.value;
    const appointmentTime = this.slotForm.controls.timeSlot.value;
    const defaultTypeId = this.appointmentTypes()[0]?.typeId;

    if (!physicianId || !appointmentTime || !defaultTypeId) {
      this.errorMessage.set('Booking metadata is missing. Please refresh and try again.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.bookingApi
      .scheduleAppointment({
        patientId: 0,
        physicianId,
        typeId: defaultTypeId,
        appointmentTime,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.submitting.set(false);
          this.successMessage.set(response.message);
          this.loadSlots();
        },
        error: (error) => {
          this.submitting.set(false);
          this.errorMessage.set(error?.error?.message ?? 'Failed to book appointment.');
          this.loadSlots();
        },
      });
  }

  private loadReferenceData(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      specialties: this.bookingApi.getSpecialties(),
      appointmentTypes: this.bookingApi.getAppointmentTypes(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ specialties, appointmentTypes }) => {
          this.specialties.set(specialties);
          this.appointmentTypes.set(appointmentTypes);
          this.loading.set(false);
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(
            error?.status === 403
              ? 'Unable to load doctor catalog for patient booking with current permissions.'
              : 'Failed to load booking options.'
          );
        },
      });
  }

  private loadPhysiciansBySpecialty(specialtyId: number): void {
    this.loadingDoctors.set(true);

    this.bookingApi
      .getPhysiciansBySpecialty(specialtyId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (physicians) => {
          this.physicians.set(physicians);
          this.loadingDoctors.set(false);
        },
        error: (error) => {
          this.loadingDoctors.set(false);
          this.physicians.set([]);
          this.errorMessage.set(error?.error?.message ?? 'Failed to load doctors for the selected specialty.');
        },
      });
  }

  private loadSlots(): void {
    const physicianId = this.doctorForm.controls.physicianId.value;
    const dateValue = this.slotForm.controls.appointmentDate.value;

    this.availableSlots.set([]);

    if (!physicianId || !dateValue) {
      this.loadingSlots.set(false);
      return;
    }

    const date = new Date(dateValue);
    date.setHours(0, 0, 0, 0);

    this.loadingSlots.set(true);

    this.bookingApi
      .getAvailableAppointmentSlots(physicianId, date)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (slots) => {
          this.availableSlots.set(slots);
          this.loadingSlots.set(false);
        },
        error: (error) => {
          this.loadingSlots.set(false);
          this.errorMessage.set(error?.error?.message ?? 'Failed to load available time slots.');
        },
      });
  }
}