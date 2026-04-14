import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  roleHint = 'staff';
  setupMode = false;

  form = this.fb.group({
    email: ['zjebbari89@gmail.com', [Validators.required, Validators.email]],
    password: ['SecurePass123!', [Validators.required]],
  });

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const role = (params.get('role') ?? 'staff').toLowerCase();
      this.setupMode = (params.get('mode') ?? '').toLowerCase() === 'setup';
      this.roleHint = role === 'patient' ? 'patient' : 'staff';
      this.successMessage = params.get('reset') === 'success'
        ? 'Password updated. You can now sign in with your new password.'
        : null;
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = null;

    this.auth.login(this.form.value as any).subscribe({
      next: (response) => {
        this.loading = false;

        const role = response.role?.toLowerCase();

        if (role === 'admin') {
          this.router.navigate(['admin']);
          return;
        }

        if (role === 'personnel') {
          this.router.navigate(['home']);
          return;
        }

        if (role === 'patient') {
          this.router.navigate(['patients']);
          return;
        }

        if (role === 'physician' || role === 'doctor') {
          this.router.navigate(['doctor/my-calendar']);
          return;
        }

        this.router.navigate(['home']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err?.error ?? 'Login failed. Please check your credentials.';
      },
    });
  }
}
