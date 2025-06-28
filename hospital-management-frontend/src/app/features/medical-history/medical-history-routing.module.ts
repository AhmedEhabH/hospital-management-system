import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MedicalHistoryComponent } from './medical-history.component';
import { TimelineComponent } from './timeline/timeline.component';
import { FormComponent } from './form/form.component';
import { DetailsComponent } from './details/details.component';
import { MedicalHistoryFormComponent } from './medical-history-form/medical-history-form.component';

const routes: Routes = [
	// { path: '', redirectTo: 'timeline', pathMatch: 'full' },
	{ path: 'timeline', component: TimelineComponent },
	{ path: 'history', component: MedicalHistoryComponent },
	{ path: 'form', component: FormComponent },
	{ path: 'details/:id', component: DetailsComponent },
	{ path: 'create', component: MedicalHistoryFormComponent },
	{ path: 'edit/:id', component: MedicalHistoryFormComponent },
	{ path: '', redirectTo: 'create', pathMatch: 'full' }
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MedicalHistoryRoutingModule { }
