import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Components
import { PatientRegistrationComponent } from './patient-registration/patient-registration.component';
import { RegistrationRoutingModule } from './registration-routing.module';


@NgModule({
	declarations: [
		PatientRegistrationComponent
	],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		RegistrationRoutingModule,

		// Angular Material Modules
		MatCardModule,
		MatButtonModule,
		MatIconModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatCheckboxModule,
		MatProgressBarModule,
		MatTooltipModule,
		MatSnackBarModule,
		MatIconModule,
	]
})
export class RegistrationModule { }
