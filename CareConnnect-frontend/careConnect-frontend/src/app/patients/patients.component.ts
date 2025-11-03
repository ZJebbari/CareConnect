import { Component, computed, effect, signal } from '@angular/core';
import { PatientResult } from '../models/patientResult';
import { dataPatientService } from '../services/data.patient.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-patients',
  imports: [MatButtonModule, MatTableModule, MatInputModule],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.scss',
})
export class PatientsComponent {
  public readonly patients = computed(() => {
    debugger;
    return this.dataService.patientData() ?? [];
  });

  public dataSource = signal<MatTableDataSource<PatientResult>>(
    new MatTableDataSource()
  );
  constructor(private dataService: dataPatientService) {}
}
