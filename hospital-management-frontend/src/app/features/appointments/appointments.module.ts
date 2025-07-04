import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppointmentsRoutingModule } from './appointments-routing.module';
import { AppointmentSchedulerComponent } from './appointment-scheduler/appointment-scheduler.component';
import { CalendarViewComponent } from './calendar-view/calendar-view.component';
import { SharedModule } from '../../shared/shared.module';
import { AppointmentBookingDialogComponent } from './appointment-booking-dialog/appointment-booking-dialog.component';

// Third-party modules
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { AppointmentDetailsDialogComponent } from './appointment-details-dialog/appointment-details-dialog.component';


@NgModule({
  declarations: [
    AppointmentSchedulerComponent,
    CalendarViewComponent,
    AppointmentBookingDialogComponent,
    AppointmentDetailsDialogComponent
  ],
  imports: [
    CommonModule,
    AppointmentsRoutingModule,
	SharedModule,
	// Calendar module with date adapter
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    
    // Angular Material Modules
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatMenuModule,
    MatButtonToggleModule
  ]
})
export class AppointmentsModule { }
