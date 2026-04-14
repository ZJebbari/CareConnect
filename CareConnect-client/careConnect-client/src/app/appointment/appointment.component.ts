import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin, merge } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { AppointmentTypeResult } from '../models/appointmentTypeResult';
import { PatientResult } from '../models/patientResult';
import { PhysicianResult } from '../models/physicianResult';
import { AdminService } from '../services/admin.service';
import {
  AppointmentBookingRequest,
  SchedulingService,
} from '../services/scheduling.service';

@Component({
  selector: 'app-appointment',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.scss',
})
export class AppointmentComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly schedulingService = inject(SchedulingService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly today = new Date();
  protected readonly patients = signal<PatientResult[]>([]);
  protected readonly physicians = signal<PhysicianResult[]>([]);
  protected readonly appointmentTypes = signal<AppointmentTypeResult[]>([]);
  protected readonly availableSlots = signal<string[]>([]);
  protected readonly loadingReferenceData = signal(true);
  protected readonly loadingSlots = signal(false);
  protected readonly submitting = signal(false);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly selectedPhysicianId = signal<number | null>(null);
  protected readonly selectedDate = signal<Date | null>(new Date());

  protected readonly bookingForm = this.formBuilder.group({
    patientId: this.formBuilder.control<number | null>(null, Validators.required),
    physicianId: this.formBuilder.control<number | null>(null, Validators.required),
    appointmentDate: this.formBuilder.control<Date | null>(new Date(), Validators.required),
    timeSlot: this.formBuilder.control<string | null>(null, Validators.required),
    typeId: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(1)]),
  });

  protected readonly selectedPhysician = computed(() => {
    const physicianId = this.selectedPhysicianId();
    return this.physicians().find((physician) => physician.physicianId === physicianId) ?? null;
  });

  protected readonly selectedPatient = computed(() => {
    const patientId = this.bookingForm.controls.patientId.value;
    return this.patients().find((patient) => patient.patiendID === patientId) ?? null;
  });

  protected readonly selectedAppointmentType = computed(() => {
    const typeId = this.bookingForm.controls.typeId.value;
    return this.appointmentTypes().find((appointmentType) => appointmentType.typeId === typeId) ?? null;
  });

  protected readonly canBookAppointment = computed(() =>
    this.bookingForm.valid && !this.submitting() && !this.loadingSlots()
  );

  constructor() {
    this.loadReferenceData();

    merge(
      this.bookingForm.controls.physicianId.valueChanges.pipe(
        startWith(this.bookingForm.controls.physicianId.value)
      ),
      this.bookingForm.controls.appointmentDate.valueChanges.pipe(
        startWith(this.bookingForm.controls.appointmentDate.value)
      )
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.selectedPhysicianId.set(this.bookingForm.controls.physicianId.value);
        this.selectedDate.set(
          this.normalizeDate(this.bookingForm.controls.appointmentDate.value)
        );
        this.loadAvailableSlots();
      });
  }

  protected chooseTimeSlot(slot: string) {
    this.bookingForm.controls.timeSlot.setValue(slot);
    this.bookingForm.controls.timeSlot.markAsDirty();
    this.bookingForm.controls.timeSlot.markAsTouched();
  }

  protected refreshSlots() {
    this.loadAvailableSlots();
  }

  protected submitBooking() {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const appointmentTime = this.bookingForm.controls.timeSlot.value;
    const physicianId = this.bookingForm.controls.physicianId.value;
    const patientId = this.bookingForm.controls.patientId.value;
    const typeId = this.bookingForm.controls.typeId.value;

    if (!appointmentTime || !physicianId || !patientId || !typeId) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload: AppointmentBookingRequest = {
      patientId,
      physicianId,
      typeId,
      appointmentTime,
      appointmentStatus: true,
    };

    this.schedulingService
      .validateAppointmentAvailability(physicianId, appointmentTime)
      .pipe(
        switchMap(() => this.schedulingService.scheduleAppointment(payload)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.submitting.set(false);
          this.successMessage.set(response.message);
          this.bookingForm.controls.timeSlot.reset(null);
          this.loadAvailableSlots();
        },
        error: (error) => {
          this.submitting.set(false);
          this.errorMessage.set(
            error?.error?.message ?? 'Failed to create appointment.'
          );
          this.loadAvailableSlots();
        },
      });
  }

  protected isSelectedSlot(slot: string): boolean {
    return this.bookingForm.controls.timeSlot.value === slot;
  }

  protected trackById(_index: number, item: PatientResult | PhysicianResult) {
    if ('physicianId' in item) {
      return item.physicianId;
    }

    return item.patiendID;
  }

  protected trackAppointmentType(_index: number, item: AppointmentTypeResult) {
    return item.typeId;
  }

  protected trackSlot(_index: number, slot: string) {
    return slot;
  }

  private loadReferenceData() {
    this.loadingReferenceData.set(true);

    forkJoin({
      patients: this.adminService.getAllPatients(),
      physicians: this.adminService.getAllPhysicians(),
      appointmentTypes: this.schedulingService.getAppointmentTypes(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ patients, physicians, appointmentTypes }) => {
          this.patients.set(patients);
          this.physicians.set(physicians.filter((physician) => physician.availability));
          this.appointmentTypes.set(appointmentTypes);
          this.loadingReferenceData.set(false);
        },
        error: (error) => {
          console.error('Failed to load booking reference data:', error);
          this.errorMessage.set('Failed to load doctors, patients, and appointment types.');
          this.loadingReferenceData.set(false);
        },
      });
  }

  private loadAvailableSlots() {
    const physicianId = this.bookingForm.controls.physicianId.value;
    const appointmentDate = this.normalizeDate(
      this.bookingForm.controls.appointmentDate.value
    );

    this.availableSlots.set([]);
    this.bookingForm.controls.timeSlot.reset(null, { emitEvent: false });

    if (!physicianId || !appointmentDate) {
      this.loadingSlots.set(false);
      return;
    }

    this.loadingSlots.set(true);
    this.errorMessage.set(null);

    this.schedulingService
      .getAvailableAppointmentSlots(physicianId, appointmentDate)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (slots) => {
          this.availableSlots.set(slots);
          this.loadingSlots.set(false);
        },
        error: (error) => {
          console.error('Failed to load available slots:', error);
          this.availableSlots.set([]);
          this.errorMessage.set(
            error?.error?.message ?? 'Failed to load available time slots.'
          );
          this.loadingSlots.set(false);
        },
      });
  }

  private normalizeDate(date: Date | string | null | undefined): Date | null {
    if (!date) {
      return null;
    }

    const normalized = new Date(date);

    if (Number.isNaN(normalized.getTime())) {
      return null;
    }

    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }
}
