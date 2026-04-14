import { Component, computed, effect, input, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { dataAdminService } from '../../services/data.admin.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { CC_UI } from '../../style/care-connect-constants';
import { PersonnelResult } from '../../models/personnelResult';
import { PersonnelDetailsComponent } from '../personnel-details/personnel-details.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-table-personnel',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginator,
    MatSortModule,
    MatIconModule,
    CdkScrollable,
    PersonnelDetailsComponent,
    MatButtonModule,
  ],
  templateUrl: './table-personnel.component.html',
  styleUrl: './table-personnel.component.scss',
  animations: [CC_UI.EXPANSION_PANEL_SLIDE_ANIMATION, CC_UI.CHEVRON_ANIMATION],
})
export class TablePersonnelComponent {
  public readonly personnel = computed(() => this.dataService.personnelData() ?? []);

  public displayedColumns: string[] = [
    'fullName',
    'email',
    'phone',
    'roleID',
    'createdAt',
    'chevron',
  ];

  private sort = viewChild.required(MatSort);
  private paginator = viewChild.required(MatPaginator);

  public dataSource = signal<MatTableDataSource<PersonnelResult>>(
    new MatTableDataSource<PersonnelResult>()
  );

  public expandedPersonnel: PersonnelResult | null = null;
  public showCreateForm = signal<boolean>(false);
  public pageSize = signal<number>(CC_UI.DEFAULT_PAGINATION_OPTION);
  public pageIndex = signal<number>(0);
  public CC_UI = CC_UI;
  public filterInputSearch = input.required<string>();

  constructor(private dataService: dataAdminService) {
    effect(() => {
      const search = (this.filterInputSearch() ?? '').toLowerCase();
      if (search.length > 0) {
        this.dataSource().data = this.personnel().filter((person) => {
          return person.fullName.toLowerCase().includes(search);
        });
      } else {
        this.dataSource().data = this.personnel();
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource().sort = this.sort();
    this.dataSource().paginator = this.paginator();
  }

  public roleLabel(roleID: number): string {
    if (roleID === 3) {
      return 'Support';
    }

    if (roleID === 4) {
      return 'Personnel';
    }

    return `Role ${roleID}`;
  }

  public expandClick(personnel: PersonnelResult): void {
    this.expandedPersonnel =
      this.expandedPersonnel?.userId === personnel.userId ? null : personnel;
  }

  public toggleCreateForm(): void {
    this.showCreateForm.update((current) => !current);
  }

  public onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }
}
