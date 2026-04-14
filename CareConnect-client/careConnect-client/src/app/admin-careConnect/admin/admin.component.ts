import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';


import { NavbarComponent } from '../../navbar/navbar.component';
import { TablePatientsComponent } from "../table-patients/table-patients.component";
import { TableDoctorsComponent } from "../table-doctors/table-doctors.component";
import { TablePersonnelComponent } from "../table-personnel/table-personnel.component";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    TablePatientsComponent,
    TableDoctorsComponent,
    TablePersonnelComponent
],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent {
  public filterInputSearch = signal<string>('');
  public currentToggle = signal<string>('patients');

    public setSearch(search: string | null) {
    this.filterInputSearch.set(search ?? '');
  }

  toggleCurrent($event: string) {
    this.currentToggle.set($event);
  }
}