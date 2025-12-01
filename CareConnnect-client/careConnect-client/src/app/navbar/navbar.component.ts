import { Component, effect, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from "@angular/material/icon";
import { CommonModule, NgClass } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule, 
    CommonModule
],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {

  @Output() searchOutput = new EventEmitter<string | null>();
  @Output() currentToggle = new EventEmitter<string>();
  public search = signal<string | null>(null);
  public displayClear = signal<boolean>(false);
  public isBtnActive: string = 'patients';
  
  public updateSearch(searchInput: string) {
    this.search.set(searchInput);
    this.searchOutput.emit(searchInput);
    searchInput ? this.displayClear.set(true) : this.displayClear.set(false);
  }

  public toggleCurrent() {
    this.currentToggle.emit(this.isBtnActive);
  }
  
  public clearButton() {
    this.search.set(null);
    this.searchOutput.emit(null);
    this.displayClear.set(false);
  }

  btnDoctors() {
  this.isBtnActive = 'doctors';
  this.toggleCurrent();
  }
  btnPersonnel() {
  this.isBtnActive = 'personnel';
  this.toggleCurrent(); 
  }
  btnPatient() {
  this.isBtnActive = 'patients';
  this.toggleCurrent();
  }
}
