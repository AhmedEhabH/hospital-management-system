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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';

// Your components
import { LabReportsRoutingModule } from './lab-reports-routing.module';
import { LabReportsComponent } from './lab-reports.component';
import { CriticalAlertsComponent } from './critical-alerts/critical-alerts.component';
import { LabComparisonComponent } from './lab-comparison/lab-comparison.component';
import { LabReportFormComponent } from './lab-report-form/lab-report-form.component';
import { LabReportsListComponent } from './lab-reports-list/lab-reports-list.component';

@NgModule({
	declarations: [
		LabReportsComponent,
		LabComparisonComponent,
		CriticalAlertsComponent,
  LabReportFormComponent,
  LabReportsListComponent,
	],
	imports: [
		CommonModule, // This provides *ngIf, *ngFor directives
		ReactiveFormsModule,
		FormsModule, // This provides ngModel
		LabReportsRoutingModule,

		// All Angular Material Modules your component needs
		MatCardModule,
		MatButtonModule,
		MatIconModule,
		MatProgressSpinnerModule,
		MatProgressBarModule,
		MatTableModule,
		MatChipsModule,
		MatFormFieldModule,
		MatSelectModule,
		MatSlideToggleModule,
		MatOptionModule,
		MatToolbarModule,
		MatDividerModule,
		MatListModule,
		MatBadgeModule,
		MatMenuModule,
		MatDialogModule,
		MatSnackBarModule,
		MatExpansionModule,
		MatStepperModule,
		MatCheckboxModule,
		MatRadioModule,
		MatTooltipModule,
		MatInputModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatPaginatorModule,
		MatSortModule,
		MatTabsModule,
	],
	exports: [
		CriticalAlertsComponent,
		LabReportsComponent,
		LabComparisonComponent
	]
})
export class LabReportsModule { }
