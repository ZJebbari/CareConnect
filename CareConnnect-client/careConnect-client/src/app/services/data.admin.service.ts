import { computed, effect, Injectable, signal, inject } from '@angular/core';
import { PatientResult } from '../models/patientResult';
import { PatientService } from './patient.service';
import { SocketService } from './socket.service';
import { AdminService } from './admin.service';

@Injectable({
  providedIn: 'root',
})
export class dataAdminService {
  private patients = signal<PatientResult[]>([]);
  public patientData = computed(() => {
    return this.patients();
  });

  private socket = inject(SocketService);

  constructor(private api: AdminService) {
    effect(() => {
      this.fetchPatients();
    });

     effect(() => {
      const userId = this.socket.updatedPatient();
      const deletedUserId = this.socket.deletedPatient();
      if (userId !== 0 || deletedUserId !== 0) {
        this.fetchPatients();
        this.socket.clearUpdatedPatient();
        this.socket.clearDeletedPatient();
      }
    })
  }

  fetchPatients() {
    this.api.getAllPatients().subscribe((data) => this.patients.set(data));
  }
}
