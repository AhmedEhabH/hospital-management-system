import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './dashboard/dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { SystemAnalyticsComponent } from './system-analytics/system-analytics.component';
import { HospitalManagementComponent } from './hospital-management/hospital-management.component';
import { AuditLogsComponent } from './audit-logs/audit-logs.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
	{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
	{ path: 'dashboard', component: AdminDashboardComponent },
	{ path: 'users', component: UserManagementComponent },
	{ path: 'analytics', component: SystemAnalyticsComponent },
	{ path: 'hospitals', component: HospitalManagementComponent },
	{ path: 'audit-logs', component: AuditLogsComponent },
	{ path: 'settings', component: SettingsComponent }
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AdminRoutingModule { }
