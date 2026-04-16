import { Routes } from '@angular/router';
import { AppointmentComponent } from './appointment/appointment.component';
import { PatientsComponent } from './patients/patients.component';
import { AdminComponent } from './admin-careConnect/admin/admin.component';
import { LoginComponent } from './login/login.component';
import { adminGuard } from './guards/admin.guard';
import { personnelGuard } from './guards/personnel.guard';
import { physicianGuard } from './guards/physician.guard';
import { LandingComponent } from './landing/landing.component';
import { SetPasswordComponent } from './set-password/set-password.component';
import { DoctorMyCalendarComponent } from './doctor-scheduling/doctor-my-calendar/doctor-my-calendar.component';
import { DoctorMyScheduleComponent } from './doctor-scheduling/doctor-my-schedule/doctor-my-schedule.component';
import { DoctorMyTimeOffComponent } from './doctor-scheduling/doctor-my-time-off/doctor-my-time-off.component';
import { patientGuard } from './guards/patient.guard';
import { PatientSignUpComponent } from './patient-auth/patient-sign-up.component';
import { PatientBookAppointmentComponent } from './patient-booking/patient-book-appointment.component';
import { PatientAppointmentsComponent } from './patient-booking/patient-appointments.component';

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
    path: 'patient/sign-up',
    component: PatientSignUpComponent,
  },
  {
    path: 'patient/book',
    component: PatientBookAppointmentComponent,
    canActivate: [patientGuard],
  },
  {
    path: 'patient/appointments',
    component: PatientAppointmentsComponent,
    canActivate: [patientGuard],
  },
  {
    path: 'home',
    component: AppointmentComponent,
    canActivate: [personnelGuard],
  },
  {
    path: 'doctor/my-calendar',
    component: DoctorMyCalendarComponent,
    canActivate: [physicianGuard],
  },
  {
    path: 'doctor/my-schedule',
    component: DoctorMyScheduleComponent,
    canActivate: [physicianGuard],
  },
  {
    path: 'doctor/my-time-off',
    component: DoctorMyTimeOffComponent,
    canActivate: [physicianGuard],
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
