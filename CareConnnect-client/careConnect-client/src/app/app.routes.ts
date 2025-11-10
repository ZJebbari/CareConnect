import { Routes } from '@angular/router';
import { AppointmentComponent } from './appointment/appointment.component';
import { PatientsComponent } from './patients/patients.component';
import { AdminComponent } from './admin-careConnect/admin/admin.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'admin',
  },
  {
    path: 'home',
    component: AppointmentComponent,
  },
  {
    path: 'patients',
    component: PatientsComponent,
  },
  {
    path: 'admin',
    component: AdminComponent,
  },
];
