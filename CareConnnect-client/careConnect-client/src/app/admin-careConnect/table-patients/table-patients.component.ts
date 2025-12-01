import { Component, computed, effect, input, Input, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientDetailsComponent } from '../patient-details/patient-details.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { PatientResult } from '../../models/patientResult';
import { CC_UI } from '../../style/care-connect-constants'
import { dataAdminService } from '../../services/data.admin.service';

@Component({
  selector: 'app-table-patients',
  imports: [
      CommonModule,
      PatientDetailsComponent,
      MatTableModule,
      MatPaginator,
      MatSortModule,
      MatIconModule,
      CdkScrollable,
  ],
  templateUrl: './table-patients.component.html',
  styleUrl: './table-patients.component.scss',
  animations: [CC_UI.EXPANSION_PANEL_SLIDE_ANIMATION, CC_UI.CHEVRON_ANIMATION],
})
export class TablePatientsComponent {
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
  public pageSize = signal<number>(CC_UI.DEFAULT_PAGINATION_OPTION);
  public pageIndex = signal<number>(0);
  public CC_UI = CC_UI;
  public filterInputSearch = input.required<string>();

  constructor(private dataService: dataAdminService) {
    effect(() => {
      if (this.filterInputSearch !== null) {
        this.dataSource().data = this.patients().filter((patient) => {
          return patient.fullName.toLowerCase().includes(this.filterInputSearch().toLowerCase());
        })
      }else {
        this.dataSource().data = this.patients();
      }
    })
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
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }
}
