import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PhysicianTimeOffResult } from '../../models/physicianTimeOffResult';
import { PhysicianTimeOffUpsertRequest } from '../../services/scheduling.service';

export interface TimeOffDialogData {
  mode: 'create' | 'edit';
  entry?: PhysicianTimeOffResult;
}

@Component({
  selector: 'app-time-off-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './time-off-dialog.component.html',
  styleUrl: './time-off-dialog.component.scss',
})
export class TimeOffDialogComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly data = inject<TimeOffDialogData>(MAT_DIALOG_DATA);

  protected errorMessage: string | null = null;
  protected readonly form = this.formBuilder.nonNullable.group({
    isAllDay: [this.data.entry?.isAllDay ?? false],
    startDate: [
      this.toDateInput(this.data.entry?.startDateTime ?? new Date()),
      Validators.required,
    ],
    endDate: [
      this.toDateInput(this.data.entry?.endDateTime ?? new Date()),
      Validators.required,
    ],
    startTime: [this.toTimeInput(this.data.entry?.startDateTime ?? new Date(), '09:00')],
    endTime: [this.toTimeInput(this.data.entry?.endDateTime ?? new Date(), '17:00')],
    reason: [this.data.entry?.reason ?? '', Validators.maxLength(120)],
    notes: [this.data.entry?.notes ?? '', Validators.maxLength(500)],
  });

  constructor(
    private readonly dialogRef: MatDialogRef<TimeOffDialogComponent>
  ) {
    this.form.controls.isAllDay.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((isAllDay) => {
        if (isAllDay) {
          this.form.patchValue(
            {
              startTime: '00:00',
              endTime: '23:59',
            },
            { emitEvent: false }
          );
        }
      });
  }

  protected submit() {
    this.errorMessage = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (value.endDate < value.startDate) {
      this.errorMessage = 'End date must be on or after the start date.';
      return;
    }

    const startDateTime = value.isAllDay
      ? `${value.startDate}T00:00:00`
      : `${value.startDate}T${this.toApiTime(value.startTime)}`;
    const endDateTime = value.isAllDay
      ? `${value.endDate}T23:59:59`
      : `${value.endDate}T${this.toApiTime(value.endTime)}`;

    if (new Date(startDateTime).getTime() >= new Date(endDateTime).getTime()) {
      this.errorMessage = 'End date and time must be later than the start date and time.';
      return;
    }

    const payload: PhysicianTimeOffUpsertRequest = {
      startDateTime,
      endDateTime,
      isAllDay: value.isAllDay,
      reason: value.reason.trim() || null,
      notes: value.notes.trim() || null,
    };

    this.dialogRef.close(payload);
  }

  protected cancel() {
    this.dialogRef.close();
  }

  private toApiTime(value: string): string {
    return value.length === 5 ? `${value}:00` : value;
  }

  private toDateInput(value: Date | string): string {
    return new Date(value).toISOString().slice(0, 10);
  }

  private toTimeInput(value: Date | string, fallback: string): string {
    if (!value) {
      return fallback;
    }

    if (typeof value === 'string' && value.length >= 16) {
      return value.slice(11, 16);
    }

    return new Date(value).toISOString().slice(11, 16);
  }
}