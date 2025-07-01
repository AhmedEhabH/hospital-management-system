import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppointmentsRoutingModule } from './appointments-routing.module';
import { AppointmentSchedulerComponent } from './appointment-scheduler/appointment-scheduler.component';
import { CalendarViewComponent } from './calendar-view/calendar-view.component';


@NgModule({
  declarations: [
    AppointmentSchedulerComponent,
    CalendarViewComponent
  ],
  imports: [
    CommonModule,
    AppointmentsRoutingModule
  ]
})
export class AppointmentsModule { }
