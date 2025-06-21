import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
	// FIXED: Redirect to lab-reports as default page
	{ path: '', redirectTo: '/auth', pathMatch: 'full' },
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
		loadChildren: () => import('./features/medical-history/medical-history.module').then(m => m.MedicalHistoryModule)
	},
	{
		path: 'lab-reports',
		canActivate: [AuthGuard],
		loadChildren: () => import('./features/lab-reports/lab-reports.module').then(m => m.LabReportsModule)
	},
	{
		path: 'messaging',
		canActivate: [AuthGuard],
		loadChildren: () => import('./features/messaging/messaging.module').then(m => m.MessagingModule)
	},
	// 404 page
	{
		path: '404',
		loadChildren: () => import('./shared/components/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule)
	},
	// Wildcard route - must be last
	{ path: '**', redirectTo: '/404' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
