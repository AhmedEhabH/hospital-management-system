import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppointmentsRoutingModule } from './appointments-routing.module';
import { AppointmentSchedulerComponent } from './appointment-scheduler/appointment-scheduler.component';


@NgModule({
  declarations: [
    AppointmentSchedulerComponent
  ],
  imports: [
    CommonModule,
    AppointmentsRoutingModule
  ]
})
export class AppointmentsModule { }
