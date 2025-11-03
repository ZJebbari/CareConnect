import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CareConnectHeaderComponent } from './care-connect-header/care-connect-header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CareConnectHeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'careConnect-frontend';
}
