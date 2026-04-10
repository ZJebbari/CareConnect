import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

describe('adminGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['isLoggedIn', 'isAdmin']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('redirects unauthenticated users to login', () => {
    authService.isLoggedIn.and.returnValue(false);

    const allowed = TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never));

    expect(allowed).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('redirects non-admin users to root', () => {
    authService.isLoggedIn.and.returnValue(true);
    authService.isAdmin.and.returnValue(false);

    const allowed = TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never));

    expect(allowed).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('allows authenticated admin users', () => {
    authService.isLoggedIn.and.returnValue(true);
    authService.isAdmin.and.returnValue(true);

    const allowed = TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never));

    expect(allowed).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});