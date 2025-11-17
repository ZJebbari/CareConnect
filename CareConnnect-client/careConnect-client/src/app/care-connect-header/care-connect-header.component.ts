import { Component, EventEmitter, Input, output, Output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButton } from "@angular/material/button";

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

  public toggleDarkMode() {
    this.isDarkMode.set(!this.isDarkMode());
    this.outputModeToggle.emit(this.isDarkMode());
  }
}
