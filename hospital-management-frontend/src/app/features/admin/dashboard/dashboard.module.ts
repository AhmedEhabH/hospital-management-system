import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Chart.js
// import { NgChartsModule } from 'ng2-charts';
// Chart.js - Updated for ng2-charts v6+
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

// Components
import { AdminDashboardComponent } from './dashboard.component';
import { SharedModule } from '../../../shared/shared.module';

const routes: Routes = [
	{ path: '', component: AdminDashboardComponent }
];

@NgModule({
	declarations: [
		AdminDashboardComponent
	],
	imports: [
		CommonModule,
		RouterModule.forChild(routes),

		SharedModule,
		// Angular Material Modules
		MatCardModule,
		MatButtonModule,
		MatIconModule,
		MatTableModule,
		MatPaginatorModule,
		MatSortModule,
		MatFormFieldModule,
		MatInputModule,
		MatProgressBarModule,

		// Chart.js
		BaseChartDirective
	],
	providers: [
		provideCharts(withDefaultRegisterables())
	]
})
export class DashboardModule { }
