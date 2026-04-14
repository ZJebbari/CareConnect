import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import * as signalR from '@microsoft/signalr';

interface AppointmentHubEvent {
  appointmentId: number;
  patientId: number | null;
  physicianId: number | null;
  typeId: number | null;
  appointmentStatus: boolean | null;
  appointmentTime: string | null;
}

interface PhysicianScheduleHubEvent {
  action: 'created' | 'updated' | 'deleted';
  physicianScheduleId: number;
  physicianId?: number;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  effectiveStartDate?: string;
  effectiveEndDate?: string | null;
  isActive?: boolean;
}

interface PhysicianTimeOffHubEvent {
  action: 'created' | 'updated' | 'deleted';
  physicianTimeOffId: number;
  physicianId?: number;
  startDateTime?: string;
  endDateTime?: string;
  isAllDay?: boolean;
  reason?: string | null;
  notes?: string | null;
}

export interface SchedulingCalendarRefreshRequest {
  physicianId: number | null;
  date: Date | null;
  reason:
    | 'AppointmentCreated'
    | 'AppointmentUpdated'
    | 'AppointmentCancelled'
    | 'PhysicianScheduleUpdated'
    | 'PhysicianTimeOffUpdated';
  refreshToken: number;
}

@Injectable({
  providedIn: 'root',
})
export class SchedulingSocketService {
  private hubConnection!: signalR.HubConnection;
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  public appointmentCreated = signal<AppointmentHubEvent | null>(null);
  public appointmentUpdated = signal<AppointmentHubEvent | null>(null);
  public appointmentCancelled = signal<AppointmentHubEvent | null>(null);
  public physicianScheduleUpdated = signal<PhysicianScheduleHubEvent | null>(null);
  public physicianTimeOffUpdated = signal<PhysicianTimeOffHubEvent | null>(null);
  public calendarRefreshRequest = signal<SchedulingCalendarRefreshRequest | null>(null);

  constructor() {
    this.startConnection();
    this.registerEvents();

    this.destroyRef.onDestroy(() => {
      this.unregisterEvents();
      void this.stopConnection();
    });
  }

  private startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7079/schedulingHub', {
        withCredentials: false,
        accessTokenFactory: () => this.auth.getToken() ?? '',
      } as signalR.IHttpConnectionOptions)
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Scheduling socket connected'))
      .catch((err) => console.error('Scheduling socket connection error:', err));
  }

  private registerEvents() {
    this.hubConnection.on('AppointmentCreated', (payload: AppointmentHubEvent) => {
      this.appointmentCreated.set(payload);
      this.queueCalendarRefresh(payload.physicianId, payload.appointmentTime, 'AppointmentCreated');
    });

    this.hubConnection.on('AppointmentUpdated', (payload: AppointmentHubEvent) => {
      this.appointmentUpdated.set(payload);
      this.queueCalendarRefresh(payload.physicianId, payload.appointmentTime, 'AppointmentUpdated');
    });

    this.hubConnection.on('AppointmentCancelled', (payload: AppointmentHubEvent) => {
      this.appointmentCancelled.set(payload);
      this.queueCalendarRefresh(payload.physicianId, payload.appointmentTime, 'AppointmentCancelled');
    });

    this.hubConnection.on('PhysicianScheduleUpdated', (payload: PhysicianScheduleHubEvent) => {
      this.physicianScheduleUpdated.set(payload);
      this.queueCalendarRefresh(
        payload.physicianId ?? null,
        payload.effectiveStartDate ?? null,
        'PhysicianScheduleUpdated'
      );
    });

    this.hubConnection.on('PhysicianTimeOffUpdated', (payload: PhysicianTimeOffHubEvent) => {
      this.physicianTimeOffUpdated.set(payload);
      this.queueCalendarRefresh(
        payload.physicianId ?? null,
        payload.startDateTime ?? null,
        'PhysicianTimeOffUpdated'
      );
    });
  }

  private unregisterEvents() {
    this.hubConnection.off('AppointmentCreated');
    this.hubConnection.off('AppointmentUpdated');
    this.hubConnection.off('AppointmentCancelled');
    this.hubConnection.off('PhysicianScheduleUpdated');
    this.hubConnection.off('PhysicianTimeOffUpdated');
  }

  private async stopConnection() {
    if (this.hubConnection?.state !== signalR.HubConnectionState.Disconnected) {
      await this.hubConnection.stop();
    }
  }

  private queueCalendarRefresh(
    physicianId: number | null,
    eventDate: string | null,
    reason: SchedulingCalendarRefreshRequest['reason']
  ) {
    this.calendarRefreshRequest.set({
      physicianId,
      date: eventDate ? new Date(eventDate) : null,
      reason,
      refreshToken: Date.now(),
    });
  }

  public clearAppointmentCreated() {
    this.appointmentCreated.set(null);
  }

  public clearAppointmentUpdated() {
    this.appointmentUpdated.set(null);
  }

  public clearAppointmentCancelled() {
    this.appointmentCancelled.set(null);
  }

  public clearPhysicianScheduleUpdated() {
    this.physicianScheduleUpdated.set(null);
  }

  public clearPhysicianTimeOffUpdated() {
    this.physicianTimeOffUpdated.set(null);
  }

  public clearCalendarRefreshRequest() {
    this.calendarRefreshRequest.set(null);
  }
}