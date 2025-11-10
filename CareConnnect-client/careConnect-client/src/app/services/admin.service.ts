import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PatientResult } from '../models/patientResult';
import { PatientDto } from '../models/patientDto';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private baseUrl = '/api/Patients';

  constructor(private http: HttpClient) {}

  public getAllPatients(): Observable<PatientResult[]> {
    return this.http.get<PatientResult[]>(this.baseUrl);
  }

  public updatePatient(patientPayload: PatientDto): Observable<any> {
    return this.http.put(`${this.baseUrl}/${patientPayload.userId}`, patientPayload);
  }
}
