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

// Chart.js - Updated for ng2-charts v6+
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { PatientRoutingModule } from './patient-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
	declarations: [
		DashboardComponent
	],
	imports: [
		CommonModule,
		PatientRoutingModule,
		ReactiveFormsModule,
		FormsModule,

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

		// Charts - Updated for ng2-charts v6+
		BaseChartDirective
	],
	providers: [
		provideCharts(withDefaultRegisterables())
	]
})
export class PatientModule { }
