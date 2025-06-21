import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageNotFoundComponent } from './page-not-found.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';



@NgModule({
	declarations: [
		PageNotFoundComponent
	],
	imports: [
		CommonModule,

		// Angular Material Modules
		MatToolbarModule,
		MatButtonModule,
		MatIconModule,
		MatMenuModule,
		MatFormFieldModule,
		MatInputModule,
		MatBadgeModule,
		MatTooltipModule,
		MatSnackBarModule,
		MatDividerModule,
		MatProgressBarModule,
	]
})
export class PageNotFoundModule { }
