import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CareConnectHeaderComponent } from './care-connect-header/care-connect-header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CareConnectHeaderComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'careConnect-frontend';
  public isDarkMode= signal<boolean>(false);

  public setDarkMode (isDarkMode : boolean) {
    this.isDarkMode.set(isDarkMode);
  }
}
