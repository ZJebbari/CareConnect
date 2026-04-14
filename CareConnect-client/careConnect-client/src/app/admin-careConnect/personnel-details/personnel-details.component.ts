import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ConfirmationDialogComponent } from '../../reusables/confirmation-dialog/confirmation-dialog.component';
import { Helper } from '../../helper/helper';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-personnel-details',
  imports: [MatFormFieldModule, FormsModule, MatInputModule, MatButtonModule, MatSelectModule],
  templateUrl: './personnel-details.component.html',
  styleUrl: './personnel-details.component.scss',
})
export class PersonnelDetailsComponent {
  public isCreateMode = input<boolean>(false);
  public userId = input<number>(0);
  public roleIDInput = input<number>(4);
  public fullNameInput = input<string | null>(null);
  public emailInput = input<string | null>(null);
  public phoneInput = input<string | null>(null);

  public fullName = signal<string>('');
  public email = signal<string>('');
  public phone = signal<string>('');
  public roleID = signal<number>(4);
  public password = signal<string>('');

  private original = signal({
    fullName: '',
    email: '',
    phone: '',
    roleID: 4,
  });

  private dialog = inject(MatDialog);

  public personnelPayload = computed(() => ({
    userId: this.userId() ?? 0,
    fullName: (this.fullName() ?? '').trim(),
    email: (this.email() ?? '').trim(),
    password: (this.password() ?? '').trim() || null,
    phone: (this.phone() ?? '').trim(),
    roleID: this.roleID(),
  }));

  public canCreate = computed(() => {
    const payload = this.personnelPayload();
    const hasPassword = (this.password() ?? '').trim().length > 0;

    return payload.fullName.length > 0 && payload.email.length > 0 && payload.phone.length > 0 && hasPassword;
  });

  public isDirty = computed(() => {
    return (
      (this.fullName() ?? '').trim() !== (this.original().fullName ?? '').trim() ||
      (this.email() ?? '').trim() !== (this.original().email ?? '').trim() ||
      (this.phone() ?? '').trim() !== (this.original().phone ?? '').trim() ||
      this.roleID() !== this.original().roleID ||
      (this.password() ?? '').trim().length > 0
    );
  });

  constructor(private adminService: AdminService) {
    effect(() => {
      this.fullName.set(this.fullNameInput() ?? '');
      this.email.set(this.emailInput() ?? '');
      this.phone.set(this.phoneInput() ?? '');
      this.roleID.set(this.roleIDInput() ?? 4);
      this.password.set('');

      this.original.set({
        fullName: this.fullNameInput() ?? '',
        email: this.emailInput() ?? '',
        phone: this.phoneInput() ?? '',
        roleID: this.roleIDInput() ?? 4,
      });
    });
  }

  public createPersonnel(): void {
    const payload = this.personnelPayload();
    const sanitized = { ...payload, phone: Helper.PhoneNumber(payload.phone) };

    if (!this.canCreate()) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Create Personnel',
        bodyText: `Create personnel account for ${sanitized.fullName}?`,
        confirmText: 'YES, CREATE',
        cancelText: 'NO, CANCEL',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.adminService.createPersonnel(sanitized).subscribe({
        next: () => {
          this.fullName.set('');
          this.email.set('');
          this.phone.set('');
          this.password.set('');
          this.roleID.set(4);
        },
        error: (err) => console.error('Personnel create failed', err),
      });
    });
  }

  public updatePersonnel(): void {
    const payload = this.personnelPayload();
    const sanitized = { ...payload, phone: Helper.PhoneNumber(payload.phone) };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Update Personnel',
        bodyText: 'Are you sure you want to update?',
        confirmText: 'YES, UPDATE',
        cancelText: 'NO, CANCEL',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed || !sanitized.userId) {
        return;
      }

      this.adminService.updatePersonnel(sanitized).subscribe({
        next: () => {
          this.password.set('');
          this.original.set({
            fullName: sanitized.fullName,
            email: sanitized.email,
            phone: sanitized.phone,
            roleID: sanitized.roleID,
          });
        },
        error: (err) => console.error('Personnel update failed', err),
      });
    });
  }

  public deletePersonnel(): void {
    const userId = this.userId();
    if (!userId) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Personnel',
        bodyText: `Are you sure you want to delete personnel ${this.fullName()}?`,
        confirmText: 'YES, DELETE',
        cancelText: 'NO, CANCEL',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.adminService.deletePersonnel(userId).subscribe({
        next: () => console.log('Personnel deleted'),
        error: (err) => console.error('Personnel delete failed', err),
      });
    });
  }
}
