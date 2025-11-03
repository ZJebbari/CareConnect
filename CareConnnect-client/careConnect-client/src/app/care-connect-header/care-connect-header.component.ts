import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-care-connect-header',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './care-connect-header.component.html',
  styleUrl: './care-connect-header.component.scss',
})
export class CareConnectHeaderComponent {
  @Input() userName: string = '';
}
