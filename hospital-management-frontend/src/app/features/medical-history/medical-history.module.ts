import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material Modules - ALL REQUIRED MODULES
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Shared Module
import { SharedModule } from '../../shared/shared.module';

import { MedicalHistoryRoutingModule } from './medical-history-routing.module';
import { MedicalHistoryComponent } from './medical-history.component';
import { TimelineComponent } from './timeline/timeline.component';
import { FormComponent } from './form/form.component';
import { DetailsComponent } from './details/details.component';
import { BaseChartDirective } from 'ng2-charts';
import { EventDetailsDialogComponent } from './event-details-dialog/event-details-dialog.component';
import { MatDialog, MatDialogActions, MatDialogModule } from '@angular/material/dialog';
import { EventEditDialogComponent } from './event-edit-dialog/event-edit-dialog.component';
import { ExportOptionsDialogComponent } from './export-options-dialog/export-options-dialog.component';
import { MatRadioButton, MatRadioModule } from '@angular/material/radio';

@NgModule({
	declarations: [
		MedicalHistoryComponent,
		TimelineComponent,
		FormComponent,
		DetailsComponent,
  EventDetailsDialogComponent,
  EventEditDialogComponent,
  ExportOptionsDialogComponent
	],
	imports: [
		CommonModule,
		MedicalHistoryRoutingModule,
		ReactiveFormsModule,
		FormsModule,
		BaseChartDirective,

		// Shared Module - MUST BE IMPORTED FOR app-theme-toggle
		SharedModule,

		// Angular Material - ALL REQUIRED MODULES
		MatCardModule,
		MatButtonModule,
		MatIconModule,           // FIXES mat-icon errors
		MatTabsModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatCheckboxModule,
		MatChipsModule,
		MatExpansionModule,
		MatStepperModule,
		MatProgressBarModule,    // FIXES mat-progress-bar errors
		MatDialogModule,
		MatRadioModule
	]
})
export class MedicalHistoryModule { }
