import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
	// Default redirect to login
	{ path: '', redirectTo: '/auth/login', pathMatch: 'full' },

	// Authentication routes (public access)
	{
		path: 'auth',
		loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
	},

	// Registration routes (public access)
	{
		path: 'registration',
		loadChildren: () => import('./features/registration/registration.module').then(m => m.RegistrationModule)
	},

	// Admin routes (protected)
	{
		path: 'admin',
		canActivate: [AuthGuard, RoleGuard],
		data: { expectedRoles: ['Admin'] },
		children: [
			{
				path: 'dashboard',
				loadChildren: () => import('./features/admin/dashboard/dashboard.module').then(m => m.DashboardModule)
			},
			{
				path: 'patient-management',
				loadChildren: () => import('./features/admin/patient-management/patient-management.module').then(m => m.PatientManagementModule)
			},
			{ path: '', redirectTo: 'dashboard', pathMatch: 'full' }
		]
	},

	// Doctor routes (protected)
	{
		path: 'doctor',
		canActivate: [AuthGuard, RoleGuard],
		data: { expectedRoles: ['Doctor'] },
		children: [
			{
				path: 'dashboard',
				loadChildren: () => import('./features/doctor/dashboard/dashboard.module').then(m => m.DashboardModule)
			},
			{ path: '', redirectTo: 'dashboard', pathMatch: 'full' }
		]
	},

	// Patient routes (protected)
	{
		path: 'patient',
		canActivate: [AuthGuard, RoleGuard],
		data: { expectedRoles: ['Patient'] },
		children: [
			{ path: 'dashboard', loadChildren: () => import('./features/patient/dashboard/dashboard.module').then(m => m.DashboardModule) },
			{ path: 'book-appointment', loadChildren: () => import('./features/patient-booking/patient-booking.module').then(m => m.PatientBookingModule) },
			{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
		]
	},

	// Medical History routes (protected)
	{
		path: 'medical-history',
		canActivate: [AuthGuard],
		loadChildren: () => import('./features/medical-history/medical-history.module').then(m => m.MedicalHistoryModule)
	},

	// Lab Reports routes (protected)
	{
		path: 'lab-reports',
		canActivate: [AuthGuard],
		loadChildren: () => import('./features/lab-reports/lab-reports.module').then(m => m.LabReportsModule)
	},

	// Messaging routes (protected)
	{
		path: 'messaging',
		canActivate: [AuthGuard],
		loadChildren: () => import('./features/messaging/messaging.module').then(m => m.MessagingModule)
	},

	// Feedback routes (protected)
	{
		path: 'feedback',
		canActivate: [AuthGuard],
		loadChildren: () => import('./features/feedback/feedback.module').then(m => m.FeedbackModule)
	},

	// Shared protected routes
	{ 
		path: 'appointments',
		canActivate: [AuthGuard],
		loadChildren: () => import('./features/appointments/appointments.module').then(m => m.AppointmentsModule)
	},

	// Wildcard route - must be last
	{ path: '**', redirectTo: '/auth/login' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes, {
		enableTracing: false,
		useHash: false,
		preloadingStrategy: PreloadAllModules
	})],
	exports: [RouterModule]
})
export class AppRoutingModule { }
