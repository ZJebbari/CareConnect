import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { personnelGuard } from './personnel.guard';
import { AuthService } from '../services/auth.service';

describe('personnelGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['isLoggedIn', 'isPersonnel']);
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

    const allowed = TestBed.runInInjectionContext(() => personnelGuard({} as never, {} as never));

    expect(allowed).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('redirects non-personnel users to root', () => {
    authService.isLoggedIn.and.returnValue(true);
    authService.isPersonnel.and.returnValue(false);

    const allowed = TestBed.runInInjectionContext(() => personnelGuard({} as never, {} as never));

    expect(allowed).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('allows authenticated personnel users', () => {
    authService.isLoggedIn.and.returnValue(true);
    authService.isPersonnel.and.returnValue(true);

    const allowed = TestBed.runInInjectionContext(() => personnelGuard({} as never, {} as never));

    expect(allowed).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});