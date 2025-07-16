import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { MessagingComponent } from './messaging.component';
import { NotificationCenterComponent } from './notification-center/notification-center.component';
import { ComposeMessageComponent } from './compose-message/compose-message.component';

const routes = [
	{
		path: '',
		component: MessagingComponent
	},
	{
		path: 'chat/:id',
		component: ChatWindowComponent
	},
	{
		path: 'notifications',
		component: NotificationCenterComponent
	},
	{ path: 'compose', component: ComposeMessageComponent },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MessagingRoutingModule { }
