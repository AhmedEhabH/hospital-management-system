import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
	{ path: '', redirectTo: '/auth/login', pathMatch: 'full' },
	{
		path: 'auth',
		loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
	},
	{
		path: 'patient-dashboard',
		canActivate: [AuthGuard],
		data: { role: 'Patient' },
		loadChildren: () => import('./features/patient/patient.module').then(m => m.PatientModule)
	},
	{
		path: 'doctor-dashboard',
		canActivate: [AuthGuard],
		data: { role: 'Doctor' },
		loadChildren: () => import('./features/doctor/doctor.module').then(m => m.DoctorModule)
	},
	{
		path: 'admin-dashboard',
		canActivate: [AuthGuard],
		data: { role: 'Admin' },
		loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
	},
	{
		path: 'medical-history',
		canActivate: [AuthGuard],
		// Remove role restriction - accessible to all authenticated users
		loadChildren: () => import('./features/medical-history/medical-history.module').then(m => m.MedicalHistoryModule)
	},
	{
		path: 'lab-reports',
		canActivate: [AuthGuard],
		// Remove role restriction - accessible to all authenticated users
		loadChildren: () => import('./features/lab-reports/lab-reports.module').then(m => m.LabReportsModule)
	},
	{
		path: 'messaging',
		canActivate: [AuthGuard],
		// Remove role restriction - accessible to all authenticated users
		loadChildren: () => import('./features/messaging/messaging.module').then(m => m.MessagingModule)
	},
	{ path: '**', redirectTo: '/auth/login' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
