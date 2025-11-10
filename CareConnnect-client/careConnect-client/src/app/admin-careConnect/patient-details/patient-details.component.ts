import { Component, computed, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-patient-details',
  imports: [MatFormFieldModule, FormsModule, MatInputModule, MatButtonModule],
  templateUrl: './patient-details.component.html',
  styleUrl: './patient-details.component.scss',
})
export class PatientDetailsComponent {
  public fullName = model<string | null>(null);
  public dateOfBirth = model<string | null>(null);
  public gender = model<string | null>(null);
  public address = model<string | null>(null);
  public phone = model<string | null>(null);
  public email = model<string | null>(null);

  private original = signal({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    phone: '',
    email: '',
  });

  public patientPayload = computed(() => ({
    fullName: (this.fullName() ?? '').trim(),
    dateOfBirth: (this.dateOfBirth() ?? '').trim(),
    gender: (this.gender() ?? '').trim(),
    address: (this.address() ?? '').trim(),
    phone: (this.phone() ?? '').trim(),
    email: (this.email() ?? '').trim(),
  }));

  // private _api = inject(CarrierService);
  // private _utilsService = inject(UtilitiesService);
  // private _messageService = inject(UserMessageService);
  private _subscription = new Subscription();

  ngOnInit(): void {
    this.setupSignalFromInputs();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  // Detect unsaved changes
  isDirty = computed(() => {
    return (
      (this.fullName()?.trim().length ?? 0 > 0) &&
      ((this.dateOfBirth() ?? '').trim() !== this.original().dateOfBirth ||
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
      dateOfBirth: this.dateOfBirth() ?? '',
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

  // Delete carrier confirmation
  deleteCarrier(): void {
    const modal = {
      title: 'Delete Carrier',
      bodyText: 'Are you sure you want to delete?',
      confirmText: 'YES, DELETE',
      cancelText: 'NO, CANCEL',
    };
  }

  // Update carrier confirmation
  updateCarrier(): void {
    const modal = {
      title: 'Update Carrier',
      bodyText: 'Are you sure you want to update?',
      confirmText: 'YES, UPDATE',
      cancelText: 'NO, CANCEL',
    };
  }
}
