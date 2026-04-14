import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PhysicianScheduleResult } from '../../models/physicianScheduleResult';
import { PhysicianScheduleUpsertRequest } from '../../services/scheduling.service';

export interface ScheduleBlockDialogData {
  mode: 'create' | 'edit';
  schedule?: PhysicianScheduleResult;
}

export interface ScheduleBlockDialogResult {
  payload: Omit<PhysicianScheduleUpsertRequest, 'dayOfWeek'>;
  selectedWeekdays: number[];
}

interface DayOption {
  label: string;
  value: number;
}

@Component({
  selector: 'app-schedule-block-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  templateUrl: './schedule-block-dialog.component.html',
  styleUrl: './schedule-block-dialog.component.scss',
})
export class ScheduleBlockDialogComponent {
  private readonly formBuilder = inject(FormBuilder);
  protected readonly data = inject<ScheduleBlockDialogData>(MAT_DIALOG_DATA);

  protected readonly dayOptions: DayOption[] = [
    { label: 'Monday', value: 1 },
    { label: 'Tuesday', value: 2 },
    { label: 'Wednesday', value: 3 },
    { label: 'Thursday', value: 4 },
    { label: 'Friday', value: 5 },
    { label: 'Saturday', value: 6 },
    { label: 'Sunday', value: 7 },
  ];

  protected errorMessage: string | null = null;
  protected readonly form = this.formBuilder.nonNullable.group({
    selectedWeekdays: [[this.data.schedule?.dayOfWeek ?? 1], Validators.required],
    startTime: [
      this.toTimeInput(this.data.schedule?.startTime ?? '09:00:00'),
      Validators.required,
    ],
    endTime: [
      this.toTimeInput(this.data.schedule?.endTime ?? '17:00:00'),
      Validators.required,
    ],
    slotDurationMinutes: [
      this.data.schedule?.slotDurationMinutes ?? 60,
      [Validators.required, Validators.min(5)],
    ],
    effectiveStartDate: [
      this.toDateInput(this.data.schedule?.effectiveStartDate ?? new Date()),
      Validators.required,
    ],
    effectiveEndDate: [this.toOptionalDateInput(this.data.schedule?.effectiveEndDate ?? null)],
    isActive: [this.data.schedule?.isActive ?? true],
  });

  constructor(
    private readonly dialogRef: MatDialogRef<ScheduleBlockDialogComponent>
  ) {}

  protected submit() {
    this.errorMessage = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const selectedWeekdays = [...value.selectedWeekdays].sort((left, right) => left - right);

    if (selectedWeekdays.length === 0) {
      this.errorMessage = 'Select at least one weekday.';
      return;
    }

    if (this.toMinutes(value.startTime) >= this.toMinutes(value.endTime)) {
      this.errorMessage = 'End time must be later than start time.';
      return;
    }

    if (value.effectiveEndDate && value.effectiveEndDate < value.effectiveStartDate) {
      this.errorMessage = 'Effective end date must be on or after the start date.';
      return;
    }

    const result: ScheduleBlockDialogResult = {
      selectedWeekdays,
      payload: {
      startTime: this.toApiTime(value.startTime),
      endTime: this.toApiTime(value.endTime),
      slotDurationMinutes: value.slotDurationMinutes,
      effectiveStartDate: value.effectiveStartDate,
      effectiveEndDate: value.effectiveEndDate || null,
      isActive: value.isActive,
      },
    };

    this.dialogRef.close(result);
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

  private toOptionalDateInput(value: Date | string | null): string {
    return value ? this.toDateInput(value) : '';
  }

  private toMinutes(value: string): number {
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private toTimeInput(value: string): string {
    return value.slice(0, 5);
  }
}