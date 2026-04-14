import { computed, effect, Injectable, signal } from '@angular/core';
import { PatientResult } from '../models/patientResult';
import { PatientService } from './patient.service';

@Injectable({
  providedIn: 'root',
})
export class dataPatientService {
  private patients = signal<PatientResult[]>([]);
  public patientData = computed(() => {
    return this.patients;
  });

  constructor(private api: PatientService) {
    // effect(() => {
    //   this.fetchPatients();
    // });
  }

  // fetchPatients() {
  //   this.api.getAllPatients().subscribe((data) => this.patients.set(data));
  // }
}
