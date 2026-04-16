import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppointmentTypeResult } from '../models/appointmentTypeResult';
import { CurrentDoctorResult } from '../models/currentDoctorResult';
import { PhysicianScheduleResult } from '../models/physicianScheduleResult';
import { PhysicianTimeOffResult } from '../models/physicianTimeOffResult';

export interface AppointmentBookingRequest {
  patientId: number;
  physicianId: number;
  typeId: number;
  appointmentTime: string;
  appointmentStatus?: boolean;
}

export interface AppointmentBookingResponse {
  message: string;
  data: {
    appointmentId: number;
    patientId: number;
    physicianId: number;
    typeId: number;
    appointmentStatus: boolean | null;
    appointmentTime: string;
    createdAt: string | null;
    updatedAt: string | null;
  };
}

export interface AvailabilityValidationResponse {
  message: string;
}

export interface PhysicianScheduleUpsertRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  effectiveStartDate: string;
  effectiveEndDate: string | null;
  isActive: boolean;
}

export interface PhysicianTimeOffUpsertRequest {
  startDateTime: string;
  endDateTime: string;
  isAllDay: boolean;
  reason: string | null;
  notes: string | null;
}

export interface CrudResponse<T> {
  message: string;
  data: T;
}

export interface DeleteResponse {
  message: string;
}

export interface DoctorDayAppointment {
  appointmentId: number;
  patientName: string;
  appointmentTime: string;
  appointmentTypeName: string;
  specialtyName: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class SchedulingService {
  private careConnectBaseUrl = '/api/CareConnect';
  private appointmentTypeBaseUrl = '/api/AppointmentTypes/Admin/AppointmentTypes';
  private scheduleBaseUrl = '/api/PhysicianSchedules/Admin/PhysicianSchedules';
  private doctorScheduleBaseUrl = '/api/PhysicianSchedules/Doctor/MySchedules';
  private timeOffBaseUrl = '/api/PhysicianTimeOff/Admin/PhysicianTimeOff';
  private doctorTimeOffBaseUrl = '/api/PhysicianTimeOff/Doctor/MyTimeOff';
  private appointmentBaseUrl = '/api/AppointmentScheduling/Appointment';

  constructor(private http: HttpClient) {}

  public getAppointmentTypes(): Observable<AppointmentTypeResult[]> {
    return this.http.get<AppointmentTypeResult[]>(this.appointmentTypeBaseUrl);
  }

  public getCurrentDoctor(): Observable<CurrentDoctorResult> {
    return this.http.get<CurrentDoctorResult>(
      `${this.careConnectBaseUrl}/Doctor/CurrentPhysician`
    );
  }

  public getPhysicianSchedules(
    physicianId: number,
    asOfDate?: Date,
    activeOnly: boolean = true
  ): Observable<PhysicianScheduleResult[]> {
    let params = new HttpParams().set('activeOnly', activeOnly);

    if (asOfDate) {
      params = params.set('asOfDate', asOfDate.toISOString());
    }

    return this.http.get<PhysicianScheduleResult[]>(
      `${this.scheduleBaseUrl}/${physicianId}`,
      { params }
    );
  }

  public getCurrentDoctorSchedules(
    asOfDate?: Date,
    activeOnly: boolean = true
  ): Observable<PhysicianScheduleResult[]> {
    let params = new HttpParams().set('activeOnly', activeOnly);

    if (asOfDate) {
      params = params.set('asOfDate', asOfDate.toISOString());
    }

    return this.http.get<PhysicianScheduleResult[]>(this.doctorScheduleBaseUrl, {
      params,
    });
  }

  public createCurrentDoctorSchedule(
    payload: PhysicianScheduleUpsertRequest
  ): Observable<CrudResponse<PhysicianScheduleResult>> {
    return this.http.post<CrudResponse<PhysicianScheduleResult>>(
      this.doctorScheduleBaseUrl,
      payload
    );
  }

  public updateCurrentDoctorSchedule(
    scheduleId: number,
    payload: PhysicianScheduleUpsertRequest
  ): Observable<CrudResponse<PhysicianScheduleResult>> {
    return this.http.put<CrudResponse<PhysicianScheduleResult>>(
      `${this.doctorScheduleBaseUrl}/${scheduleId}`,
      payload
    );
  }

  public deleteCurrentDoctorSchedule(scheduleId: number): Observable<DeleteResponse> {
    return this.http.delete<DeleteResponse>(`${this.doctorScheduleBaseUrl}/${scheduleId}`);
  }

  public getPhysicianTimeOff(
    physicianId: number,
    rangeStart?: Date,
    rangeEnd?: Date
  ): Observable<PhysicianTimeOffResult[]> {
    let params = new HttpParams();

    if (rangeStart) {
      params = params.set('rangeStart', rangeStart.toISOString());
    }

    if (rangeEnd) {
      params = params.set('rangeEnd', rangeEnd.toISOString());
    }

    return this.http.get<PhysicianTimeOffResult[]>(
      `${this.timeOffBaseUrl}/${physicianId}`,
      { params }
    );
  }

  public getCurrentDoctorTimeOff(
    rangeStart?: Date,
    rangeEnd?: Date
  ): Observable<PhysicianTimeOffResult[]> {
    let params = new HttpParams();

    if (rangeStart) {
      params = params.set('rangeStart', rangeStart.toISOString());
    }

    if (rangeEnd) {
      params = params.set('rangeEnd', rangeEnd.toISOString());
    }

    return this.http.get<PhysicianTimeOffResult[]>(this.doctorTimeOffBaseUrl, {
      params,
    });
  }

  public createCurrentDoctorTimeOff(
    payload: PhysicianTimeOffUpsertRequest
  ): Observable<CrudResponse<PhysicianTimeOffResult>> {
    return this.http.post<CrudResponse<PhysicianTimeOffResult>>(
      this.doctorTimeOffBaseUrl,
      payload
    );
  }

  public updateCurrentDoctorTimeOff(
    timeOffId: number,
    payload: PhysicianTimeOffUpsertRequest
  ): Observable<CrudResponse<PhysicianTimeOffResult>> {
    return this.http.put<CrudResponse<PhysicianTimeOffResult>>(
      `${this.doctorTimeOffBaseUrl}/${timeOffId}`,
      payload
    );
  }

  public deleteCurrentDoctorTimeOff(timeOffId: number): Observable<DeleteResponse> {
    return this.http.delete<DeleteResponse>(`${this.doctorTimeOffBaseUrl}/${timeOffId}`);
  }

  public getAvailableAppointmentSlots(
    physicianId: number,
    date: Date
  ): Observable<string[]> {
    const bookingDay = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const params = new HttpParams().set('date', bookingDay);

    return this.http.get<string[]>(
      `${this.appointmentBaseUrl}/Availability/${physicianId}`,
      { params }
    );
  }

  public getCurrentDoctorAppointments(date: Date): Observable<DoctorDayAppointment[]> {
    const bookingDay = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const params = new HttpParams().set('date', bookingDay);

    return this.http.get<DoctorDayAppointment[]>(
      '/api/AppointmentScheduling/Doctor/MyAppointments',
      { params }
    );
  }

  public validateAppointmentAvailability(
    physicianId: number,
    appointmentTime: string
  ): Observable<AvailabilityValidationResponse> {
    const params = new HttpParams()
      .set('physicianId', physicianId)
      .set('appointmentTime', appointmentTime);

    return this.http.get<AvailabilityValidationResponse>(
      `${this.appointmentBaseUrl}/Validate`,
      { params }
    );
  }

  public scheduleAppointment(
    payload: AppointmentBookingRequest
  ): Observable<AppointmentBookingResponse> {
    return this.http.post<AppointmentBookingResponse>(
      `${this.appointmentBaseUrl}/Schedule`,
      payload
    );
  }
}