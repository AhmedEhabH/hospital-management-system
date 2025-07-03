import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppointmentsRoutingModule } from './appointments-routing.module';
import { AppointmentSchedulerComponent } from './appointment-scheduler/appointment-scheduler.component';
import { CalendarViewComponent } from './calendar-view/calendar-view.component';
import { SharedModule } from '../../shared/shared.module';
import { AppointmentBookingDialogComponent } from './appointment-booking-dialog/appointment-booking-dialog.component';


@NgModule({
  declarations: [
    AppointmentSchedulerComponent,
    CalendarViewComponent,
    AppointmentBookingDialogComponent
  ],
  imports: [
    CommonModule,
    AppointmentsRoutingModule,
	SharedModule
  ]
})
export class AppointmentsModule { }
