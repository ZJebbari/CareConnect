import { Routes } from '@angular/router';
import { AppointmentComponent } from './appointment/appointment.component';
import { PatientsComponent } from './patients/patients.component';
import { AdminComponent } from './admin-careConnect/admin/admin.component';
import { LoginComponent } from './login/login.component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    component: LoginComponent,
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
    canActivate: [adminGuard], // protect admin
  },
];
