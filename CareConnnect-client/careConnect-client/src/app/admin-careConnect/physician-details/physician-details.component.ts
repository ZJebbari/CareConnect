import { Component, computed, effect, inject, input, signal } from '@angular/core';
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
import { Helper } from '../../helper/helper';

@Component({
  selector: 'app-physician-details',
  imports: [MatFormFieldModule, FormsModule, CommonModule, MatInputModule, MatButtonModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './physician-details.component.html',
  styleUrl: './physician-details.component.scss'
})
export class PhysicianDetailsComponent {
  // Input properties from parent
  public userId = input<number>(0);
  public fullNameInput = input<string | null>(null);
  public specialtyInput = input<string | null>(null);
  public emailInput = input<string | null>(null);
  public phoneInput = input<string | null>(null);
  public availabilityInput = input<boolean>(false);
  public bioInput = input<string | null>(null);

  // Form state signals
  public fullName = signal<string>('');
  public specialty = signal<string>('');
  public email = signal<string>('');
  public phone = signal<string>('');
  public availability = signal<boolean>(false);
  public bio = signal<string>('');

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
    specialtyID: this.resolveSpecialtyId((this.specialty() ?? '').trim()),
    phone: (this.phone() ?? '').trim(),
    email: (this.email() ?? '').trim(),
    password: null,
    availability: this.availability(),
    bio: (this.bio() ?? '').trim(),
  }));

  public specialties = computed(() => this.dataService.specialtyData());
  
  private _subscription = new Subscription();
  private dialog = inject(MatDialog);
  
  constructor(private dataService: dataAdminService, private _adminService: AdminService){
    // Initialize form signals from inputs and set original values
    effect(() => {
      const userId = this.userId();
      const fullNameInput = this.fullNameInput();
      const specialtyInput = this.specialtyInput();
      const emailInput = this.emailInput();
      const phoneInput = this.phoneInput();
      const availabilityInput = this.availabilityInput();
      const bioInput = this.bioInput();

      if (userId && fullNameInput) {
        this.fullName.set(fullNameInput);
        this.specialty.set(specialtyInput || '');
        this.email.set(emailInput || '');
        this.phone.set(phoneInput || '');
        this.availability.set(availabilityInput);
        this.bio.set(bioInput || '');

        this.original.set({
          fullName: fullNameInput,
          specialty: specialtyInput || '',
          phone: phoneInput || '',
          email: emailInput || '',
          availability: availabilityInput,
          bio: bioInput || '',
        });
      }
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
        const sanitized = { ...payload, phone: Helper.PhoneNumber(payload.phone) };

        this._adminService.updatePhysician(sanitized).subscribe({
          next: () => {
            console.log('Physician updated');
            this.original.set({ ...payload });
          },
          error: (err) => {
            console.log('Update failed', err);
          }
        });
      }
    });
  }

  private resolveSpecialtyId(specialty: string): number | null {
    const match = this.specialties().find(
      (s) => s.specialty.toLowerCase() === specialty.toLowerCase()
    );

    return match?.specialtyID ?? null;
  }
}
