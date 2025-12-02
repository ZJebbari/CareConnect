import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PatientResult } from '../models/patientResult';
import { PatientDto } from '../models/patientDto';
import { PhysicianResult } from '../models/physicianResult';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private baseUrl = '/api/CareConnect/admin';

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
}
