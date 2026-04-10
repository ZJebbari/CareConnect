import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PatientResult } from '../models/patientResult';
import { PatientDto } from '../models/patientDto';
import { PhysicianResult } from '../models/physicianResult';
import { PhysicianDto } from '../models/physicianDto';
import { SpecialtyResult } from '../models/specialtyResult';
import { PersonnelResult } from '../models/personnelResult';
import { PersonnelDto } from '../models/personnelDto';

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
}
