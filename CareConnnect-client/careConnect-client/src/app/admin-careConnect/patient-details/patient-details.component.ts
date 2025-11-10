import { Component, computed, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { ConfirmationDialogComponent } from '../../reusables/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AdminService } from '../../services/admin.service';
@Component({
  selector: 'app-patient-details',
  imports: [MatFormFieldModule, FormsModule, MatInputModule, MatButtonModule],
  templateUrl: './patient-details.component.html',
  styleUrl: './patient-details.component.scss',
})
export class PatientDetailsComponent {
  public userId = model<number>(0);
  public fullName = model<string | null>(null);
  public dateOfBirth = model<Date>(new Date());
  public gender = model<string | null>(null);
  public address = model<string | null>(null);
  public phone = model<string | null>(null);
  public email = model<string | null>(null);


  private original = signal({
    fullName: '',
    dateOfBirth: new Date(),
    gender: '',
    address: '',
    phone: '',
    email: '',
  });

  public patientPayload = computed(() => ({
    userId: this.userId() ?? '',
    fullName: (this.fullName() ?? '').trim(),
    dateOfBirth: this.dateOfBirth(),
    gender: (this.gender() ?? '').trim(),
    address: (this.address() ?? '').trim(),
    phone: (this.phone() ?? '').trim(),
    email: (this.email() ?? '').trim(),
  }));

  private _subscription = new Subscription();
  private dialog = inject(MatDialog);

  constructor(private _adminService: AdminService){}

  ngOnInit(): void {
    this.setupSignalFromInputs();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  // Detect unsaved changes
  isDirty = computed(() => {
  const current = this.dateOfBirth();
  const original = this.original().dateOfBirth;

  const sameDate =
    current instanceof Date &&
    original instanceof Date &&
    current.toDateString() === original.toDateString();

  return (
    (this.fullName()?.trim().length ?? 0 > 0) &&
    (!sameDate ||
      (this.gender() ?? '').trim() !== this.original().gender ||
      (this.address() ?? '').trim() !== this.original().address ||
      (this.phone() ?? '').trim() !== this.original().phone ||
      (this.email() ?? '').trim() !== this.original().email)
  );
});


  // Initialize the form signals
  private setupSignalFromInputs(): void {
    this.original.set({
      fullName: this.fullName() ?? '',
      dateOfBirth: this.dateOfBirth(),
      gender: this.gender() ?? '',
      address: this.address() ?? '',
      phone: this.phone() ?? '',
      email: this.email() ?? '',
    });
  }

  public restoreIfEmpty(): void {
    if (!this.fullName() || this.fullName()?.trim() === '') {
      this.fullName.set(this.original().fullName);
    }
  }

  // Delete Patient confirmation
  deletePatient(): void {
    const modal = {
      title: 'Delete Patient',
      bodyText: 'Are you sure you want to delete?',
      confirmText: 'YES, DELETE',
      cancelText: 'NO, CANCEL',
    };
  }

  // Update Patient confirmation
  updatePatient(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent,{
      data: {
      title: 'Update Patient',
      bodyText: 'Are you sure you want to update?',
      confirmText: 'YES, UPDATE',
      cancelText: 'NO, CANCEL',
    },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      const userId = this.userId()
      if (confirmed && userId) {
        const payload = this.patientPayload();
        this._adminService.updatePatient(payload).subscribe({
          next: () => {
            console.log('Patient updated');
            this.original.set({...payload})
          },
          error: (err) => {
            console.log("Update failed", err);
          }
        })
      }
    })

  }
}
