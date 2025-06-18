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

// PrimeNG Modules
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

// Chart.js
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

// Shared Module
import { SharedModule } from '../../shared/shared.module';

import { LabReportsRoutingModule } from './lab-reports-routing.module';
import { LabReportsComponent } from './lab-reports.component';
import { ViewerComponent } from './viewer/viewer.component';
import { TrendsComponent } from './trends/trends.component';
import { CriticalAlertsComponent } from './critical-alerts/critical-alerts.component';

@NgModule({
	declarations: [
		LabReportsComponent,
		ViewerComponent,
		TrendsComponent,
		CriticalAlertsComponent,
	],
	imports: [
		CommonModule,
		LabReportsRoutingModule,
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

		// PrimeNG
		TimelineModule,
		CardModule,
		ButtonModule,

		// Charts
		BaseChartDirective
	],
	providers: [
		provideCharts(withDefaultRegisterables())
	]
})
export class LabReportsModule { }
