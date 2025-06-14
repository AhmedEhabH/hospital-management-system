import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard as AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
	{ path: '', redirectTo: '/auth/login', pathMatch: 'full' },
	{
		path: 'auth',
		loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
	},

	// Protected routes (will be implemented later)
	{
		path: 'admin-dashboard',
		canActivate: [AuthGuard],
		data: { role: 'Admin' },
		loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
	},
	{
		path: 'doctor-dashboard',
		canActivate: [AuthGuard],
		data: { role: 'Doctor' },
		loadChildren: () => import('./features/doctor/doctor.module').then(m => m.DoctorModule)
	},
	{
		path: 'patient-dashboard',
		canActivate: [AuthGuard],
		data: { role: 'Patient' },
		loadChildren: () => import('./features/patient/patient.module').then(m => m.PatientModule)
	},

	// Fallback route
	{ path: '**', redirectTo: '/auth/login' }
];


@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
