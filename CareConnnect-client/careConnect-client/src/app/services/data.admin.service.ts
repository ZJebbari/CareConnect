import { computed, effect, Injectable, signal, inject } from '@angular/core';
import { PatientResult } from '../models/patientResult';
import { PatientService } from './patient.service';
import { SocketService } from './socket.service';
import { AdminService } from './admin.service';
import { PhysicianResult } from '../models/physicianResult';
import { SpecialtyResult } from '../models/specialtyResult';
import { PersonnelResult } from '../models/personnelResult';

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

  private specialties = signal<SpecialtyResult[]>([]);
  public specialtyData = computed(() => this.specialties());

  private personnel = signal<PersonnelResult[]>([]);
  public personnelData = computed(() => this.personnel());

  private socket = inject(SocketService);

  constructor(private api: AdminService) {
      this.fetchPatients();
      this.fetchPhysicians();
      this.fetchSpecialties();
      this.fetchPersonnel();

     effect(() => {
      const userId = this.socket.updatedPatient();
      const deletedUserId = this.socket.deletedPatient();
      const physicianUserId = this.socket.updatedPhysician();
      const deletedPhysicianUserId = this.socket.deletedPhysician();
      if (userId !== 0 || deletedUserId !== 0 || physicianUserId !== 0 || deletedPhysicianUserId !== 0) {
        this.fetchPatients();
        this.fetchPhysicians();
        this.fetchPersonnel();
        this.socket.clearUpdatedPatient();
        this.socket.clearDeletedPatient();
        this.socket.clearUpdatedPhysician();
        this.socket.clearDeletedPhysician();
      }
    })
  }

  private fetchPatients() {
    this.api.getAllPatients().subscribe((data) => this.patients.set(data));
  }

  private fetchPhysicians() {
    this.api.getAllPhysicians().subscribe((data) => this.physicians.set(data));
  }

  private fetchSpecialties() {
  this.api.getAllSpecialty().subscribe(data => this.specialties.set(data));
  }

  private fetchPersonnel() {
    // For now, return empty array until backend is implemented
    this.personnel.set([]);
  }

}
