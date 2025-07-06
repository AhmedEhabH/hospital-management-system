import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PatientBookingRoutingModule } from './patient-booking-routing.module';
import { PatientBookingWizardComponent } from './patient-booking-wizard/patient-booking-wizard.component';
import { DoctorSelectionComponent } from './doctor-selection/doctor-selection.component';
import { TimeSlotSelectionComponent } from './time-slot-selection/time-slot-selection.component';


@NgModule({
  declarations: [
    PatientBookingWizardComponent,
    DoctorSelectionComponent,
    TimeSlotSelectionComponent
  ],
  imports: [
    CommonModule,
    PatientBookingRoutingModule
  ]
})
export class PatientBookingModule { }
