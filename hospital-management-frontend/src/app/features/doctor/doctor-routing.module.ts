import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PatientManagementComponent } from './patient-management/patient-management.component';
import { MedicalRecordsComponent } from './medical-records/medical-records.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { PrescriptionsComponent } from './prescriptions/prescriptions.component';

const routes: Routes = [
	{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
	{ path: 'dashboard', component: DashboardComponent },
	{ path: 'patients', component: PatientManagementComponent },
	{ path: 'medical-records', component: MedicalRecordsComponent },
	{ path: 'appointments', component: AppointmentsComponent },
	{ path: 'prescriptions', component: PrescriptionsComponent }
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class DoctorRoutingModule { }
