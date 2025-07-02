import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Components
import { FeedbackFormComponent } from './feedback-form/feedback-form.component';
import { FeedbackRoutingModule } from './feedback-routing.module';
import { SharedModule } from '../../shared/shared.module';

// const routes: Routes = [
// 	{ path: '', component: FeedbackFormComponent },
// 	{ path: 'form', component: FeedbackFormComponent }
// ];

@NgModule({
	declarations: [
		FeedbackFormComponent
	],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		// RouterModule.forChild(routes),
		FeedbackRoutingModule,
		
		SharedModule,

		// Angular Material Modules
		MatCardModule,
		MatButtonModule,
		MatIconModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatSnackBarModule
	]
})
export class FeedbackModule { }
