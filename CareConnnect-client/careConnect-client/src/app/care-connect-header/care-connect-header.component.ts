import { Component, effect, EventEmitter, Input, output, Output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButton } from "@angular/material/button";
import { AuthService, AuthUser } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-care-connect-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButton],
  templateUrl: './care-connect-header.component.html',
  styleUrl: './care-connect-header.component.scss',
})
export class CareConnectHeaderComponent {
  @Input() userName: string = '';
  public isDarkMode = signal<boolean>(false);

  @Output() outputModeToggle = new EventEmitter<boolean>();

  public user = signal<AuthUser | null>(null);
  
  constructor(private authService: AuthService, private router: Router) {
    effect(() => {
      this.user.set(this.authService.currentUser());
    });
  }

  logout() {
  this.authService.logout();
  this.router.navigate(['login']);
  }

  public toggleDarkMode() {
    this.isDarkMode.set(!this.isDarkMode());
    this.outputModeToggle.emit(this.isDarkMode());
  }
}
