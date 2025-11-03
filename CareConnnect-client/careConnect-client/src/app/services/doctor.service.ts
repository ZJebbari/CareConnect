import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  private baseUrl = '/api/doctors';

  constructor(private http: HttpClient) {}

  // getAllDoctors(): Observable<Doctor[]> {
  //   return this.http.get<Doctor[]>(this.baseUrl);
  // }
}
