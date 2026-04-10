import { Component, computed, effect, input, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { dataAdminService } from '../../services/data.admin.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { PatientResult } from '../../models/patientResult';
import { CC_UI } from '../../style/care-connect-constants';

@Component({
  selector: 'app-table-personnel',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginator,
    MatSortModule,
    MatIconModule,
],
  templateUrl: './table-personnel.component.html',
  styleUrl: './table-personnel.component.scss',
  animations: [CC_UI.EXPANSION_PANEL_SLIDE_ANIMATION, CC_UI.CHEVRON_ANIMATION],
})
export class TablePersonnelComponent {
  public readonly personnel = computed(
    () => this.dataService.personnelData() ?? []
  )

  public displayedColumns: string[] =[
    'fullName',
    'email',
    'phone',
    'role',
    'createdAt',
  ]

  private sort = viewChild.required(MatSort);
  private paginator = viewChild.required(MatPaginator);

  public dataSource = signal<MatTableDataSource<PatientResult>>(
    new MatTableDataSource<PatientResult>()
  );

  public pageSize = signal<number>(CC_UI.DEFAULT_PAGINATION_OPTION);
  public pageIndex = signal<number>(0);
  public CC_UI = CC_UI;
  public filterInputSearch = input.required<string>()

  constructor(private dataService: dataAdminService) {
    effect(() => {
      if (this.filterInputSearch !== null) {
        this.dataSource().data = this.personnel().filter((person) => {
          return person.fullName.toLowerCase().includes(this.filterInputSearch().toLowerCase())
        })
      }else {
        this.dataSource().data = this.personnel();
      }
    })
  }

  ngAfterViewInit(): void {
    this.dataSource().sort = this.sort();
    this.dataSource().paginator = this.paginator();
  }

  public onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }
}
