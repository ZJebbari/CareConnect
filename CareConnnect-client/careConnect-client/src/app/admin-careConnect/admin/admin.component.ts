import { Component, computed, effect, signal, viewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';

import { PatientResult } from '../../models/patientResult';
import { dataAdminService } from '../../services/data.admin.service';
import { NavbarComponent } from '../../navbar/navbar.component';
import { PatientDetailsComponent } from '../patient-details/patient-details.component';
import { CC_UI } from '../../style/care-connect-constants'

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    PatientDetailsComponent,
    MatTableModule,
    MatPaginator,
    MatSortModule,
    MatIconModule,
    CdkScrollable,
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  animations: [CC_UI.EXPANSION_PANEL_SLIDE_ANIMATION, CC_UI.CHEVRON_ANIMATION],
})
export class AdminComponent {
  public readonly patients = computed(
    () => this.dataService.patientData() ?? []
  );

  public displayedColumns: string[] = [
    'fullName',
    'dateOfBirth',
    'gender',
    'address',
    'phone',
    'email',
    'chevron',
  ];

  private sort = viewChild.required(MatSort);
  private paginator = viewChild.required(MatPaginator);

  public dataSource = signal<MatTableDataSource<PatientResult>>(
    new MatTableDataSource<PatientResult>()
  );

  public expandedPatient: PatientResult | null = null;
  public pageSize = signal<number>(CC_UI.DEFAULT_PAGINATION_OPTION)
  public pageIndex = signal<number>(0)
  public CC_UI = CC_UI

  constructor(private dataService: dataAdminService) {
    // keep table data in sync with signal
    effect(() => {
      this.dataSource().data = this.patients();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource().sort = this.sort();
    this.dataSource().paginator = this.paginator();
  }

  // called when you click a row
  public expandClick(patient: PatientResult): void {
    this.expandedPatient =
      this.expandedPatient?.fullName === patient.fullName ? null : patient;
  }

  public onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex)
    this.pageSize.set(event.pageSize)
  }
}
