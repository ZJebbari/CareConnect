import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  errorMessage: string | null = null;

  form = this.fb.group({
    email: ['zjebbari89@gmail.com', [Validators.required, Validators.email]],
    password: ['SecurePass123!', [Validators.required]],
  });

  submit() {
    if (this.form.invalid) return;
    
    this.loading = true;
    this.errorMessage = null;

    this.auth.login(this.form.value as any).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['admin']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err?.error ?? 'Login failed. Please check your credentials.';
      },
    });
  }
}
