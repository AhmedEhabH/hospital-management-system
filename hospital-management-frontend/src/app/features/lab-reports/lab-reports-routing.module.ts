import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LabReportsComponent } from './lab-reports.component';
import { ViewerComponent } from './viewer/viewer.component';
import { TrendsComponent } from './trends/trends.component';
import { CriticalAlertsComponent } from './critical-alerts/critical-alerts.component';
import { LabComparisonComponent } from './lab-comparison/lab-comparison.component';

// const routes: Routes = [
// 	{ path: '', redirectTo: 'reports', pathMatch: 'full' },
// 	{ path: 'reports', component: LabReportsComponent },
// 	{ path: 'viewer/:id', component: ViewerComponent },
// 	{ path: 'trends', component: TrendsComponent },
// 	{ path: 'alerts', component: CriticalAlertsComponent }
// ];

const routes = [
	{
		path: '',
		component: LabReportsComponent
	},
	{
		path: 'comparison',
		component: LabComparisonComponent
	},
	{
		path: 'critical-alerts',
		component: CriticalAlertsComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class LabReportsRoutingModule { }
