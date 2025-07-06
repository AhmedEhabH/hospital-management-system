import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientBookingWizardComponent } from './patient-booking-wizard/patient-booking-wizard.component';

const routes: Routes = [{ path: '', component: PatientBookingWizardComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientBookingRoutingModule { }
