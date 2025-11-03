import { Routes } from '@angular/router';
import { AppointmentComponent } from './appointment/appointment.component';
import { PatientsComponent } from './patients/patients.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'patients',
  },
  {
    path: 'home',
    component: AppointmentComponent,
  },
  {
    path: 'patients',
    component: PatientsComponent,
  },
];
