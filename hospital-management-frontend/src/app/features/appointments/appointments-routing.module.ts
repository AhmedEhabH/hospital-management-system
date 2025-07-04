import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppointmentSchedulerComponent } from './appointment-scheduler/appointment-scheduler.component';

const routes: Routes = [
	{ path: '', component: AppointmentSchedulerComponent },
	{ path: 'scheduler', component: AppointmentSchedulerComponent }
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AppointmentsRoutingModule { }
