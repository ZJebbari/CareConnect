import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PatientResult } from '../models/patientResult';
import { PatientDto } from '../models/patientDto';
import { PhysicianResult } from '../models/physicianResult';
import { PhysicianDto } from '../models/physicianDto';
import { SpecialtyResult } from '../models/specialtyResult';
import { PersonnelResult } from '../models/personnelResult';
import { PersonnelDto } from '../models/personnelDto';
import { PhysicianScheduleResult } from '../models/physicianScheduleResult';
import { PhysicianTimeOffResult } from '../models/physicianTimeOffResult';

export interface AdminPhysicianSchedulePayload {
  physicianId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  effectiveStartDate: string;
  effectiveEndDate: string | null;
  isActive: boolean;
}

export interface AdminPhysicianTimeOffPayload {
  physicianId: number;
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

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private baseUrl = '/api/CareConnect/admin';
  private physicianScheduleBaseUrl = '/api/PhysicianSchedules/Admin/PhysicianSchedules';
  private physicianTimeOffBaseUrl = '/api/PhysicianTimeOff/Admin/PhysicianTimeOff';

  constructor(private http: HttpClient) {}

  public getAllPatients(): Observable<PatientResult[]> {
    return this.http.get<PatientResult[]>(`${this.baseUrl}/patients`);
  }

  public updatePatient(patientPayload: PatientDto): Observable<string> {
    return this.http.put(`${this.baseUrl}/patients/${patientPayload.userId}`, patientPayload, {responseType: 'text'});
  }

  public deletePatient(patientId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/patients/${patientId}`);
  }

  public getAllPhysicians(): Observable<PhysicianResult[]> {
    return this.http.get<PhysicianResult[]>(`${this.baseUrl}/physicians`)
  }

  public updatePhysician(physicianPayload: PhysicianDto): Observable<string> {
    return this.http.put(`${this.baseUrl}/physicians/${physicianPayload.userId}`, physicianPayload, {responseType: 'text'});
  }

  public deletePhysician(physicianId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/physicians/${physicianId}`);
  }

  public getAllSpecialty(): Observable<SpecialtyResult[]> {
    return this.http.get<SpecialtyResult[]>(`${this.baseUrl}/specialty`)
  }

  public getAllPersonnels(): Observable<PersonnelResult[]> {
    return this.http.get<PersonnelResult[]>(`${this.baseUrl}/personnels`);
  }

  public createPersonnel(personnelPayload: PersonnelDto): Observable<string> {
    return this.http.post(`${this.baseUrl}/personnels`, personnelPayload, { responseType: 'text' });
  }

  public updatePersonnel(personnelPayload: PersonnelDto): Observable<string> {
    return this.http.put(`${this.baseUrl}/personnels/${personnelPayload.userId}`, personnelPayload, {responseType: 'text'});
  }

  public deletePersonnel(personnelId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/personnels/${personnelId}`);
  }

  public getPhysicianSchedules(
    physicianId: number,
    asOfDate?: Date,
    activeOnly: boolean = false
  ): Observable<PhysicianScheduleResult[]> {
    let params = new HttpParams().set('activeOnly', activeOnly);

    if (asOfDate) {
      params = params.set('asOfDate', asOfDate.toISOString());
    }

    return this.http.get<PhysicianScheduleResult[]>(
      `${this.physicianScheduleBaseUrl}/${physicianId}`,
      { params }
    );
  }

  public createPhysicianSchedule(
    payload: AdminPhysicianSchedulePayload
  ): Observable<CrudResponse<PhysicianScheduleResult>> {
    return this.http.post<CrudResponse<PhysicianScheduleResult>>(
      this.physicianScheduleBaseUrl,
      payload
    );
  }

  public updatePhysicianSchedule(
    scheduleId: number,
    payload: AdminPhysicianSchedulePayload
  ): Observable<CrudResponse<PhysicianScheduleResult>> {
    return this.http.put<CrudResponse<PhysicianScheduleResult>>(
      `${this.physicianScheduleBaseUrl}/${scheduleId}`,
      payload
    );
  }

  public deletePhysicianSchedule(scheduleId: number): Observable<DeleteResponse> {
    return this.http.delete<DeleteResponse>(`${this.physicianScheduleBaseUrl}/${scheduleId}`);
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
      `${this.physicianTimeOffBaseUrl}/${physicianId}`,
      { params }
    );
  }

  public createPhysicianTimeOff(
    payload: AdminPhysicianTimeOffPayload
  ): Observable<CrudResponse<PhysicianTimeOffResult>> {
    return this.http.post<CrudResponse<PhysicianTimeOffResult>>(
      this.physicianTimeOffBaseUrl,
      payload
    );
  }

  public updatePhysicianTimeOff(
    timeOffId: number,
    payload: AdminPhysicianTimeOffPayload
  ): Observable<CrudResponse<PhysicianTimeOffResult>> {
    return this.http.put<CrudResponse<PhysicianTimeOffResult>>(
      `${this.physicianTimeOffBaseUrl}/${timeOffId}`,
      payload
    );
  }

  public deletePhysicianTimeOff(timeOffId: number): Observable<DeleteResponse> {
    return this.http.delete<DeleteResponse>(`${this.physicianTimeOffBaseUrl}/${timeOffId}`);
  }
}
