import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const patientGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/login'], { queryParams: { role: 'patient' } });
    return false;
  }

  if (!auth.isPatient()) {
    router.navigate(['/']);
    return false;
  }

  return true;
};