import { Component, computed, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { SpecialtyResult } from '../../models/specialtyResult';
import { dataAdminService } from '../../services/data.admin.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-physician-details',
  imports: [MatFormFieldModule, FormsModule, CommonModule, MatInputModule, MatButtonModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './physician-details.component.html',
  styleUrl: './physician-details.component.scss'
})
export class PhysicianDetailsComponent {

  public userId = model<number>(0);
  public fullName = model<string | null>(null);
  public specialty = model<string | null>(null);
  public email = model<string | null>(null);
  public phone = model<string | null>(null);
  public availability = model<string | null>(null);

  private original = signal({
    fullName: '',
    specialty: '',
    phone: '',
    email: '',
    availability: '',
  });

  public physicianPayload = computed(() => ({
    userId: this.userId() ?? '',
    fullName: (this.fullName() ?? '').trim(),
    specialty: (this.specialty() ?? '').trim(),
    phone: (this.phone() ?? '').trim(),
    email: (this.email() ?? '').trim(),
    availability: (this.availability() ?? '').trim(),
  }));

  public specialties = computed(() => this.dataService.specialtyData());
  
  private _subscription = new Subscription();
  private dialog = inject(MatDialog);
  
  constructor(private dataService: dataAdminService){}
  
  ngOnInit(): void {
  }

  public isDirty(): boolean {
    return false;
  }
  public deletePhysician() {
  }
  public updatePhysician() {
  }
}
