import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';

// Chart.js - Updated for ng2-charts v6+
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

// Shared Module
import { SharedModule } from '../../shared/shared.module';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './dashboard/dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { SystemAnalyticsComponent } from './system-analytics/system-analytics.component';
import { HospitalManagementComponent } from './hospital-management/hospital-management.component';
import { AuditLogsComponent } from './audit-logs/audit-logs.component';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
	declarations: [
		AdminDashboardComponent,
		UserManagementComponent,
		SystemAnalyticsComponent,
		HospitalManagementComponent,
		AuditLogsComponent,
		SettingsComponent
	],
	imports: [
		CommonModule,
		AdminRoutingModule,
		ReactiveFormsModule,
		FormsModule,

		// Shared Module
		SharedModule,

		// Angular Material
		MatCardModule,
		MatButtonModule,
		MatIconModule,
		MatTabsModule,
		MatTableModule,
		MatPaginatorModule,
		MatSortModule,
		MatChipsModule,
		MatProgressBarModule,
		MatDividerModule,
		MatListModule,
		MatBadgeModule,
		MatMenuModule,
		MatToolbarModule,
		MatSidenavModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatDialogModule,
		MatSnackBarModule,
		MatExpansionModule,
		MatStepperModule,
		MatSlideToggleModule,
		MatCheckboxModule,
		MatRadioModule,

		// Charts
		BaseChartDirective
	],
	providers: [
		provideCharts(withDefaultRegisterables())
	]
})
export class AdminModule { }
