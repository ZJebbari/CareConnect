import { Routes } from '@angular/router';
import { AppointmentComponent } from './appointment/appointment.component';
import { PatientsComponent } from './patients/patients.component';
import { AdminComponent } from './admin-careConnect/admin/admin.component';
import { LoginComponent } from './login/login.component';
import { adminGuard } from './guards/admin.guard';
import { personnelGuard } from './guards/personnel.guard';
import { LandingComponent } from './landing/landing.component';
import { SetPasswordComponent } from './set-password/set-password.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'set-password',
    component: SetPasswordComponent,
  },
  {
    path: 'home',
    component: AppointmentComponent,
    canActivate: [personnelGuard],
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
