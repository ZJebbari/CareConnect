import { computed, effect, Injectable, signal, inject } from '@angular/core';
import { PatientResult } from '../models/patientResult';
import { PatientService } from './patient.service';
import { SocketService } from './socket.service';
import { AdminService } from './admin.service';
import { PhysicianResult } from '../models/physicianResult';

@Injectable({
  providedIn: 'root',
})
export class dataAdminService {
  private patients = signal<PatientResult[]>([]);
  public patientData = computed(() => {
    return this.patients();
  });

  private physicians = signal<PhysicianResult[]>([]);
  public physicianData = computed(() => {
    return this.physicians();
  });

  private socket = inject(SocketService);

  constructor(private api: AdminService) {
    effect(() => {
      this.fetchPatients();
      this.fetchPhysicians();
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

  private fetchPatients() {
    this.api.getAllPatients().subscribe((data) => this.patients.set(data));
  }

  private fetchPhysicians() {
    this.api.getAllPhysicians().subscribe((data) => this.physicians.set(data));
  }

}
