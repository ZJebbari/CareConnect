import { Component, computed, effect, inject, model, signal } from '@angular/core';
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
import { ConfirmationDialogComponent } from '../../reusables/confirmation-dialog/confirmation-dialog.component';
import { AdminService } from '../../services/admin.service';

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
  public availability = model<boolean>(false);
  public bio = model<string | null>(null);

  private original = signal({
    fullName: '',
    specialty: '',
    phone: '',
    email: '',
    availability: false,
    bio: '',
  });

  public physicianPayload = computed(() => ({
    userId: this.userId() ?? 0,
    fullName: (this.fullName() ?? '').trim(),
    specialty: (this.specialty() ?? '').trim(),
    phone: (this.phone() ?? '').trim(),
    email: (this.email() ?? '').trim(),
    availability: this.availability(),
    bio: (this.bio() ?? '').trim(),
  }));

  public specialties = computed(() => this.dataService.specialtyData());
  
  private _subscription = new Subscription();
  private dialog = inject(MatDialog);
  
  constructor(private dataService: dataAdminService, private _adminService: AdminService){}

  ngOnInit(): void {
    this.setupSignalFromInputs();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  // Watch for input changes and update original values
  private inputWatcher = effect(() => {
    const userId = this.userId();
    const fullName = this.fullName();
    const specialty = this.specialty();
    const email = this.email();
    const phone = this.phone();
    const availability = this.availability();
    const bio = this.bio();

    if (userId && fullName) {
      this.original.set({
        fullName: fullName,
        specialty: specialty || '',
        phone: phone || '',
        email: email || '',
        availability: availability,
        bio: bio || '',
      });
    }
  });

  // Initialize the form signals
  private setupSignalFromInputs(): void {
    this.original.set({
      fullName: this.fullName() ?? '',
      specialty: this.specialty() ?? '',
      phone: this.phone() ?? '',
      email: this.email() ?? '',
      availability: this.availability(),
      bio: this.bio() ?? '',
    });
  }

  public isDirty(): boolean {
    return (
      (this.fullName()?.trim().length ?? 0) > 0 &&
      (this.fullName()?.trim() !== (this.original().fullName ?? '').trim()) ||
      (this.specialty() ?? '').trim() !== (this.original().specialty ?? '').trim() ||
      (this.email()?.trim().length ?? 0) > 0 &&
      (this.email()?.trim() !== (this.original().email ?? '').trim()) ||
      (this.phone()?.trim().length ?? 0) > 0 &&
      (this.phone()?.trim() !== (this.original().phone ?? '').trim()) ||
      this.availability() !== this.original().availability ||
      (this.bio()?.trim().length ?? 0) > 0 &&
      (this.bio()?.trim() !== (this.original().bio ?? '').trim())
    );
  }

  public deletePhysician(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Physician',
        bodyText: `Are you sure you want to delete physician ${this.fullName()}?`,
        confirmText: 'YES, DELETE',
        cancelText: 'NO, CANCEL'
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && this.userId()) {
        this._adminService.deletePhysician(this.userId()).subscribe({
          next: () => {
            console.log('Physician Deleted');
          },
          error: (err) => {
            console.log("Delete failed", err);
          }
        });
      }
    });
  }

  public updatePhysician(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Update Physician',
        bodyText: 'Are you sure you want to update?',
        confirmText: 'YES, UPDATE',
        cancelText: 'NO, CANCEL',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      const userId = this.userId();
      if (confirmed && userId) {
        const payload = this.physicianPayload();
        this._adminService.updatePhysician(payload).subscribe({
          next: () => {
            console.log('Physician updated');
            this.original.set({ ...payload });
          },
          error: (err) => {
            console.log("Update failed", err);
          }
        });
      }
    });
  }
}
