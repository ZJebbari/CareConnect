import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Personnel route guard: Ensures user is authenticated and has Personnel role.
 * Redirects to login if not authenticated, or home if insufficient permissions.
 */
export const personnelGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  if (!auth.isPersonnel()) {
    // User is logged in but not personnel
    router.navigate(['/']);
    return false;
  }

  return true;
};
