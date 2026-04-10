import { Component, computed, effect, inject, input, signal } from '@angular/core';
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
  // Input properties from parent
  public userId = input<number>(0);
  public fullNameInput = input<string | null>(null);
  public dateOfBirthInput = input<Date | null>(null);
  public genderInput = input<string | null>(null);
  public addressInput = input<string | null>(null);
  public phoneInput = input<string | null>(null);
  public emailInput = input<string | null>(null);

  // Form state signals
  public fullName = signal<string>('');
  public dateOfBirth = signal<Date>(new Date());
  public gender = signal<string>('');
  public address = signal<string>('');
  public phone = signal<string>('');
  public email = signal<string>('');


  private original = signal({
    fullName: '',
    dateOfBirth: new Date(),
    gender: '',
    address: '',
    phone: '',
    email: '',
  });

  public patientPayload = computed(() => ({
    userId: this.userId() ?? 0,
    fullName: (this.fullName() ?? '').trim(),
    dateOfBirth: this.dateOfBirth(),
    gender: (this.gender() ?? '').trim(),
    address: (this.address() ?? '').trim(),
    phone: (this.phone() ?? '').trim(),
    email: (this.email() ?? '').trim(),
  }));

  private _subscription = new Subscription();
  private dialog = inject(MatDialog);

  constructor(private _adminService: AdminService){
    // Initialize form signals from inputs and set original values
    effect(() => {
      const userId = this.userId();
      const fullNameInput = this.fullNameInput();
      const dateOfBirthInput = this.dateOfBirthInput();
      const genderInput = this.genderInput();
      const addressInput = this.addressInput();
      const phoneInput = this.phoneInput();
      const emailInput = this.emailInput();

      if (userId && fullNameInput) {
        this.fullName.set(fullNameInput);
        this.dateOfBirth.set(dateOfBirthInput || new Date());
        this.gender.set(genderInput || '');
        this.address.set(addressInput || '');
        this.phone.set(phoneInput || '');
        this.email.set(emailInput || '');

        this.original.set({
          fullName: fullNameInput,
          dateOfBirth: dateOfBirthInput || new Date(),
          gender: genderInput || '',
          address: addressInput || '',
          phone: phoneInput || '',
          email: emailInput || '',
        });
      }
    });
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
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data:{
        title: 'Delete Patient',
        bodyText: `Are you sure you want to delete patient ${this.fullName()}?`,
        confirmText: 'YES, DELETE',
        cancel: 'NO, CANCEL'
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && this.userId()) {
        this._adminService.deletePatient(this.userId()).subscribe({
          next: () => {
            console.log('Patient Deleted');
          },
          error: (err) => {
            console.log("Delete failed", err);
          }
        })
      }
    })
  }

  // Update Patient confirmation
  updatePatient(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
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
