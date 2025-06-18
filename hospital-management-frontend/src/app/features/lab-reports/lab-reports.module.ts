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
import { MatTooltipModule } from '@angular/material/tooltip';

// PrimeNG Modules for Advanced Data Tables
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';

// Chart.js for Data Visualization
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

// Shared Module
import { SharedModule } from '../../shared/shared.module';

import { LabReportsRoutingModule } from './lab-reports-routing.module';
import { LabReportsComponent } from './lab-reports.component';
import { LabReportViewerComponent } from './lab-report-viewer/lab-report-viewer.component';
import { LabTrendsAnalysisComponent } from './lab-trends-analysis/lab-trends-analysis.component';
import { CriticalAlertsComponent } from './critical-alerts/critical-alerts.component';
import { LabReportFormComponent } from './lab-report-form/lab-report-form.component';
import { LabComparisonComponent } from './lab-comparison/lab-comparison.component';

@NgModule({
	declarations: [
		LabReportsComponent,
		LabReportViewerComponent,
		LabTrendsAnalysisComponent,
		CriticalAlertsComponent,
		LabReportFormComponent,
		LabComparisonComponent
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
		MatTooltipModule,

		// PrimeNG
		TableModule,
		CardModule,
		ButtonModule,
		ChartModule,
		ToastModule,
		DropdownModule,
		CalendarModule,
		TagModule,
		ProgressBarModule,

		// Charts
		BaseChartDirective
	],
	providers: [
		provideCharts(withDefaultRegisterables())
	]
})
export class LabReportsModule { }
