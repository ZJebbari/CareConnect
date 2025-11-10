import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PatientResult } from '../models/patientResult';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private baseUrl = '/api/admin';

  constructor(private http: HttpClient) {}

  getAllPatients(): Observable<PatientResult[]> {
    return this.http.get<PatientResult[]>(this.baseUrl);
  }
}
