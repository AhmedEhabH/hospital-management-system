import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeedbackFormComponent } from './feedback-form/feedback-form.component';

const routes: Routes = [
	{ path: '', component: FeedbackFormComponent },
	{ path: 'form', component: FeedbackFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeedbackRoutingModule { }
