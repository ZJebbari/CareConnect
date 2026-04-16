import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  fullName: string;
}

export interface SetPasswordRequest {
  email: string;
  currentPassword: string;
  newPassword: string;
}

export interface RegisterPatientRequest {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  gender: string;
  password: string;
}

export interface ApiMessageResponse {
  message: string;
}

export interface AuthUser {
  fullName: string;
  role: string;
  token: string;
}

const TOKEN_KEY = 'cc_token';
const ROLE_KEY = 'cc_role';
const NAME_KEY = 'cc_fullName';

@Injectable({
  providedIn: 'root', // singleton across entire app
})
export class AuthService {
  private baseUrl = 'https://localhost:7079/api/Auth';

  // signal with current user (or null if logged out)
  public currentUser = signal<AuthUser | null>(this.loadUserFromStorage());

  constructor(private http: HttpClient) {}

  // ---- LOGIN ----
  public login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap((res) => {
        this.saveAuth(res);
      })
    );
  }

  public setPassword(payload: SetPasswordRequest): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(`${this.baseUrl}/set-password`, payload);
  }

  public registerPatient(payload: RegisterPatientRequest): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(`${this.baseUrl}/register`, payload);
  }

  // ---- LOGOUT ----
  public logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(NAME_KEY);
    this.currentUser.set(null);
  }

  // ---- HELPERS ----
  public getToken(): string | null {
    return this.currentUser()?.token ?? null;
  }

  public getRole(): string | null {
    return this.currentUser()?.role ?? null;
  }

  public isLoggedIn(): boolean {
    return !!this.getToken();
  }

  public isAdmin(): boolean {
    return this.getRole()?.toLowerCase() === 'admin';
  }

  public isPersonnel(): boolean {
    return this.getRole()?.toLowerCase() === 'personnel';
  }

  public isPatient(): boolean {
    return this.getRole()?.toLowerCase() === 'patient';
  }

  public isPhysician(): boolean {
    const role = this.getRole()?.toLowerCase();
    return role === 'physician' || role === 'doctor';
  }
  // ---- PRIVATE ----
  private saveAuth(res: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(ROLE_KEY, res.role);
    localStorage.setItem(NAME_KEY, res.fullName);

    this.currentUser.set({
      token: res.token,
      role: res.role,
      fullName: res.fullName,
    });
  }

  private loadUserFromStorage(): AuthUser | null {
    const token = localStorage.getItem(TOKEN_KEY);
    const role = localStorage.getItem(ROLE_KEY);
    const fullName = localStorage.getItem(NAME_KEY);

    if (!token || !role || !fullName) return null;

    return { token, role, fullName };
  }
}
