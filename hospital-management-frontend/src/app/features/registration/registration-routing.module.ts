import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientRegistrationComponent } from './patient-registration/patient-registration.component';

const routes:Routes = [
	{ path: 'patient', component: PatientRegistrationComponent },
	{ path: '', redirectTo: 'patient', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class RegistrationRoutingModule { }
