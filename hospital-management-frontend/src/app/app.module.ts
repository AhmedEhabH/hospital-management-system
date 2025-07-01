import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// Angular Material Core Modules - GLOBAL IMPORTS
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Core imports
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { CommonModule } from '@angular/common';

import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LabReportsModule } from './features/lab-reports/lab-reports.module';
import { PatientRegistrationComponent } from './features/registration/patient-registration/patient-registration.component';
import { FeedbackFormComponent } from './features/feedback/feedback-form/feedback-form.component';
import { PatientProfileComponent } from './features/patients/patient-profile/patient-profile.component';
import { PatientSearchComponent } from './features/patients/patient-search/patient-search.component';
import { PatientRecordsComponent } from './features/medical-records/patient-records/patient-records.component';
import { MedicalTimelineComponent } from './features/medical-records/medical-timeline/medical-timeline.component';
import { MedicalTrendsComponent } from './features/analytics/medical-trends/medical-trends.component';
import { PatientOutcomesComponent } from './features/analytics/patient-outcomes/patient-outcomes.component';
import { MedicalReportsComponent } from './features/reports/medical-reports/medical-reports.component';
import { ExportManagerComponent } from './features/reports/export-manager/export-manager.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RegistrationModule } from './features/registration/registration.module';

@NgModule({
	declarations: [
		AppComponent,
		FeedbackFormComponent,
		PatientProfileComponent,
		PatientSearchComponent,
		PatientRecordsComponent,
		MedicalTimelineComponent,
		MedicalTrendsComponent,
		PatientOutcomesComponent,
		MedicalReportsComponent,
		ExportManagerComponent,
		

	],
	imports: [
		LabReportsModule,
		CommonModule,
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		ReactiveFormsModule,
		HttpClientModule,

		CoreModule,
		// CRITICAL: Import SharedModule to make app-header available
		SharedModule,
		RegistrationModule,
		// Angular Material Core Modules - GLOBAL AVAILABILITY
		// Angular Material Modules
		MatToolbarModule,
		MatButtonModule,
		MatIconModule,
		MatSidenavModule,
		MatListModule,
		MatCardModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatCheckboxModule,
		MatRadioModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatTableModule,
		MatPaginatorModule,
		MatSortModule,
		MatDialogModule,
		MatSnackBarModule,
		MatProgressSpinnerModule,
		MatMenuModule,
		MatTabsModule,
		MatExpansionModule,
		MatChipsModule,
		MatBadgeModule,
		MatSlideToggleModule,
		MatProgressBarModule,

	],
	providers: [
		{
			provide: HTTP_INTERCEPTORS,
			useClass: AuthInterceptor,
			multi: true
		},
		provideCharts(withDefaultRegisterables())
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
