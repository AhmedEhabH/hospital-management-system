import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// Chart.js
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

// Components
import { PatientDashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { SharedModule } from '../../../shared/shared.module';

// const routes: Routes = [
// 	{ path: '', component: PatientDashboardComponent }
// ];

@NgModule({
	declarations: [
		PatientDashboardComponent
	],
	imports: [
		CommonModule,
		// RouterModule.forChild(routes),
		DashboardRoutingModule,

		SharedModule,

		// Angular Material Modules
		MatCardModule,
		MatButtonModule,
		MatIconModule,
		MatTableModule,
		MatFormFieldModule,
		MatInputModule,

		// Chart.js
		BaseChartDirective
	],
	providers: [
		provideCharts(withDefaultRegisterables())
	]
})
export class DashboardModule { }
