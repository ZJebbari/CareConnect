import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppointmentTypeResult } from '../models/appointmentTypeResult';

export interface BookingSpecialty {
  specialtyId: number;
  specialtyName: string;
}

export interface BookingPhysician {
  physicianId: number;
  fullName: string;
  specialtyId: number;
  specialtyName: string;
  bio: string;
}

export interface PatientBookingRequest {
  patientId: number;
  physicianId: number;
  typeId: number;
  appointmentTime: string;
}

export interface PatientBookingResponse {
  message: string;
  data: {
    appointmentId: number;
    patientId: number;
    physicianId: number;
    typeId: number;
    appointmentStatus: number | null;
    appointmentTime: string;
    createdAt: string | null;
    updatedAt: string | null;
  };
}

export interface PatientAppointment {
  appointmentId: number;
  patientId: number;
  physicianId: number;
  physicianName: string;
  specialtyId?: number | null;
  specialtyName?: string | null;
  typeId: number;
  appointmentTypeName: string;
  appointmentStatus: number;
  appointmentTime: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PatientAppointmentsResponse {
  message: string;
  data: PatientAppointment[];
}

@Injectable({
  providedIn: 'root',
})
export class PatientBookingService {
  private readonly patientBookingBaseUrl = '/api/CareConnect/Patient/Booking';
  private readonly schedulingBaseUrl = '/api/AppointmentScheduling';
  private readonly appointmentBaseUrl = '/api/AppointmentScheduling/Appointment';
  private readonly appointmentTypeBaseUrl = '/api/AppointmentTypes/Patient/Booking/AppointmentTypes';

  constructor(private readonly http: HttpClient) {}

  public getSpecialties(): Observable<BookingSpecialty[]> {
    return this.http.get<BookingSpecialty[]>(`${this.patientBookingBaseUrl}/Specialties`);
  }

  public getPhysiciansBySpecialty(specialtyId: number): Observable<BookingPhysician[]> {
    const params = new HttpParams().set('specialtyId', specialtyId);

    return this.http.get<BookingPhysician[]>(`${this.patientBookingBaseUrl}/Physicians`, {
      params,
    });
  }

  public getAppointmentTypes(): Observable<AppointmentTypeResult[]> {
    return this.http.get<AppointmentTypeResult[]>(this.appointmentTypeBaseUrl);
  }

  public getAvailableAppointmentSlots(physicianId: number, date: Date): Observable<string[]> {
    const bookingDay = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const params = new HttpParams().set('date', bookingDay);
    return this.http.get<string[]>(`${this.appointmentBaseUrl}/Availability/${physicianId}`, {
      params,
    });
  }

  public scheduleAppointment(payload: PatientBookingRequest): Observable<PatientBookingResponse> {
    return this.http.post<PatientBookingResponse>(`${this.appointmentBaseUrl}/Schedule`, payload);
  }

  public getMyUpcomingAppointments(): Observable<PatientAppointmentsResponse> {
    return this.http.get<PatientAppointmentsResponse>(`${this.schedulingBaseUrl}/Patient/MyAppointments`);
  }

  public cancelMyAppointment(appointmentId: number): Observable<PatientBookingResponse> {
    return this.http.delete<PatientBookingResponse>(`${this.schedulingBaseUrl}/Patient/MyAppointments/${appointmentId}`);
  }
}