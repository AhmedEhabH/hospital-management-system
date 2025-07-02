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

// Components
import { PatientManagementComponent } from './patient-management.component';
import { PatientManagementRoutingModule } from './patient-management-routing.module';
import { SharedModule } from '../../../shared/shared.module';

// const routes: Routes = [
// 	{ path: '', component: PatientManagementComponent }
// ];

@NgModule({
	declarations: [
		PatientManagementComponent

	],
	imports: [
		CommonModule,
		// RouterModule.forChild(routes),
		PatientManagementRoutingModule,

		SharedModule,
		
		// Angular Material Modules
		MatCardModule,
		MatButtonModule,
		MatIconModule,
		MatTableModule,
		MatPaginatorModule,
		MatSortModule,
		MatFormFieldModule,
		MatInputModule
	]
})
export class PatientManagementModule { }
