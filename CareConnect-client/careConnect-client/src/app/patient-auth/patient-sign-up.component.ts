import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AuthService, RegisterPatientRequest } from '../services/auth.service';

@Component({
  selector: 'app-patient-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './patient-sign-up.component.html',
  styleUrl: './patient-sign-up.component.scss',
})
export class PatientSignUpComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    address: ['', Validators.required],
    gender: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const payload: RegisterPatientRequest = {
      fullName: this.form.controls.fullName.value ?? '',
      email: this.form.controls.email.value ?? '',
      phone: this.form.controls.phone.value ?? '',
      dateOfBirth: this.form.controls.dateOfBirth.value ?? '',
      address: this.form.controls.address.value ?? '',
      gender: this.form.controls.gender.value ?? '',
      password: this.form.controls.password.value ?? '',
    };

    this.auth.registerPatient(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/login'], {
          queryParams: {
            role: 'patient',
            registered: 'success',
          },
        });
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error?.error?.message ?? 'Unable to create account. Please try again.');
      },
    });
  }
}