import { Component, EventEmitter, Output, signal, Signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule, 
    CommonModule,
],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {

  @Output() searchOutput = new EventEmitter<string | null>();
  public search = signal<string | null>(null);
  public displayClear = signal<boolean>(false);

  public updateSearch(searchInput: string) {
    this.search.set(searchInput);
    this.searchOutput.emit(searchInput);
    searchInput ? this.displayClear.set(true) : this.displayClear.set(false);
  }
  
  public clearButton() {
    this.search.set(null);
    this.searchOutput.emit(null);
    this.displayClear.set(false);
  }
}
