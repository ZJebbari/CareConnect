import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { SchedulingService } from './scheduling.service';

@Injectable({
  providedIn: 'root',
})
export class DoctorContextService {
  private readonly auth = inject(AuthService);
  private readonly schedulingApi = inject(SchedulingService);
  private readonly storageKey = 'cc_physician_profile_id';
  private readonly physicianProfileIdState = signal<number | null>(
    this.loadPhysicianProfileId()
  );
  private readonly resolvingState = signal(false);
  private readonly resolveErrorState = signal<string | null>(null);

  public readonly physicianProfileId = computed(() =>
    this.physicianProfileIdState()
  );
  public readonly isResolving = computed(() => this.resolvingState());
  public readonly resolveError = computed(() => this.resolveErrorState());

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();

      if (!user) {
        this.clearPhysicianProfileId();
        this.resolveErrorState.set(null);
        this.resolvingState.set(false);
        return;
      }

      if (this.auth.isPhysician() && this.physicianProfileIdState() === null) {
        this.ensureCurrentDoctorLoaded();
      }
    });
  }

  public setPhysicianProfileId(physicianId: number) {
    if (!Number.isFinite(physicianId) || physicianId <= 0) {
      return;
    }

    localStorage.setItem(this.storageKey, String(physicianId));
    this.physicianProfileIdState.set(physicianId);
    this.resolveErrorState.set(null);
  }

  public clearPhysicianProfileId() {
    localStorage.removeItem(this.storageKey);
    this.physicianProfileIdState.set(null);
  }

  public ensureCurrentDoctorLoaded(forceRefresh: boolean = false) {
    if (!this.auth.isLoggedIn() || !this.auth.isPhysician()) {
      return;
    }

    if (this.resolvingState()) {
      return;
    }

    if (!forceRefresh && this.physicianProfileIdState() !== null) {
      return;
    }

    this.resolvingState.set(true);
    this.resolveErrorState.set(null);

    this.schedulingApi.getCurrentDoctor().subscribe({
      next: (doctor) => {
        this.setPhysicianProfileId(doctor.physicianId);
        this.resolvingState.set(false);
      },
      error: (err) => {
        this.resolveErrorState.set(
          err?.error?.message ??
            'Unable to resolve your doctor profile. Refresh and try again.'
        );
        this.resolvingState.set(false);
      },
    });
  }

  private loadPhysicianProfileId(): number | null {
    const rawValue = localStorage.getItem(this.storageKey);
    if (!rawValue) {
      return null;
    }

    const physicianId = Number(rawValue);
    return Number.isFinite(physicianId) && physicianId > 0 ? physicianId : null;
  }
}