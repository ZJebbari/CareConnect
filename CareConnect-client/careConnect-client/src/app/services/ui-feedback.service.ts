import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class UiFeedbackService {
  private readonly snackBar = inject(MatSnackBar);

  public success(message: string, action: string = 'Dismiss') {
    this.open(message, action, ['cc-snackbar', 'cc-snackbar-success']);
  }

  public error(message: string, action: string = 'Close') {
    this.open(message, action, ['cc-snackbar', 'cc-snackbar-error']);
  }

  private open(message: string, action: string, panelClass: string[]) {
    this.snackBar.open(message, action, {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass,
    });
  }
}