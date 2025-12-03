import { Component, computed, effect, input, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { dataAdminService } from '../../services/data.admin.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { PhysicianResult } from '../../models/physicianResult';
import { PatientResult } from '../../models/patientResult';
import { CC_UI } from '../../style/care-connect-constants';
import { filter } from 'rxjs';

@Component({
  selector: 'app-table-doctors',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginator,
    MatSortModule,
    MatIconModule,
    CdkScrollable,
  ],
  templateUrl: './table-doctors.component.html',
  styleUrl: './table-doctors.component.scss',
  animations: [CC_UI.EXPANSION_PANEL_SLIDE_ANIMATION, CC_UI.CHEVRON_ANIMATION],
})
export class TableDoctorsComponent {
  public readonly physicians = computed(
    () => this.dataService.physicianData() ?? []
  )

  public displayedColumns: string[] =[
    'fullName',
    'specialty',
    'email',
    'phone',
    'availability',
    'chevron',
  ]

  private sort = viewChild.required(MatSort);
  private paginator = viewChild.required(MatPaginator);

  public dataSource = signal<MatTableDataSource<PhysicianResult>>(
    new MatTableDataSource<PhysicianResult>()
  );

  public expandedPhysician: PhysicianResult | null = null;
  public pageSize = signal<number>(CC_UI.DEFAULT_PAGINATION_OPTION);
  public pageIndex = signal<number>(0);
  public CC_UI = CC_UI;
  public filterInputSearch = input.required<string>()

  constructor(private dataService: dataAdminService) {
    effect(() => {
      if (this.filterInputSearch !== null) {
        this.dataSource().data = this.physicians().filter((physician) => {
          return physician.fullName.toLowerCase().includes(this.filterInputSearch().toLowerCase())
        })
      }else {
        this.dataSource().data = this.physicians();
      }
    })
  }

  ngAfterViewInit(): void {
    this.dataSource().sort = this.sort();
    this.dataSource().paginator = this.paginator();
  }

    // called when you click a row
  public expandClick(physician: PhysicianResult): void {
    this.expandedPhysician =
      this.expandedPhysician?.fullName === physician.fullName ? null : physician;
  }

  public onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }
}
