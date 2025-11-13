import { Component, computed, effect, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { ConfirmationDialogComponent } from '../../reusables/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AdminService } from '../../services/admin.service';
import { Helper } from '../../helper/helper';
import { MatSelectModule } from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
@Component({
  selector: 'app-patient-details',
  imports: [MatFormFieldModule, FormsModule, MatInputModule, MatButtonModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule],
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
 public isDirty = computed(() => {
    const current = this.dateOfBirth();
    const original = this.original().dateOfBirth;
  
    const currentDate = current ? new Date(current) : null;
    const originalDate = original ? new Date(original) : null;
  
    const sameDate = !!currentDate && !!originalDate && currentDate.toDateString() === originalDate.toDateString();
  
    const fullNameChanged =
      ((this.fullName()?.trim().length ?? 0) > 0) &&
      (this.fullName()?.trim() !== (this.original().fullName ?? '').trim());
  
    const genderChanged =
      (this.gender() ?? '').trim() !== (this.original().gender ?? '').trim();
  
    const addressChanged =
      (this.address() ?? '').trim() !== (this.original().address ?? '').trim();
  
    const phoneChanged =
      (this.phone() ?? '').trim() !== (this.original().phone ?? '').trim();
  
    const emailChanged =
      (this.email() ?? '').trim() !== (this.original().email ?? '').trim();
  
    return (
      fullNameChanged ||
      !sameDate ||
      genderChanged ||
      addressChanged ||
      phoneChanged ||
      emailChanged
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

  public restoreFullNameIfEmpty(): void {
    Helper.restoreIfEmptyField(this.fullName(), v => this.fullName.set(v), this.original().fullName);
  }

  public restoreDateOfBirthIfEmpty(): void {
    Helper.restoreIfEmptyField(this.dateOfBirth(), v => this.dateOfBirth.set(v), this.original().dateOfBirth);
  }

  public restoreAddressIfEmpty(): void {
    Helper.restoreIfEmptyField(this.address(), v => this.address.set(v), this.original().address);
  }

  public restorePhoneIfEmpty(): void {
    Helper.restoreIfEmptyField(this.phone(), v => this.phone.set(v), this.original().phone);
  }

  public restoreEmailIfEmpty(): void {
    Helper.restoreIfEmptyField(this.email(), v => this.email.set(v), this.original().email);
  }

  dateOfBirthChanged(value: any) {
  if (!value) {
    return;
  }
  const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {  // invalid
      this.dateOfBirth.set(parsed); // valid
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
        const sanatized = {...payload, phone: Helper.PhoneNumber(payload.phone)}
        this._adminService.updatePatient(sanatized).subscribe({
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
