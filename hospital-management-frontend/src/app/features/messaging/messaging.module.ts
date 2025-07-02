import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Quill Editor
import { QuillModule } from 'ngx-quill';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatOptionModule } from '@angular/material/core';

// Chart.js for Data Visualization
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

// Shared Module
import { SharedModule } from '../../shared/shared.module';

import { MessagingRoutingModule } from './messaging-routing.module';
import { MessagingComponent } from './messaging.component';
// FIXED: Import ConversationListComponent instead of declaring it (since it's standalone)
import { ConversationListComponent } from './conversation-list/conversation-list.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { MessageComposerComponent } from './message-composer/message-composer.component';
import { NotificationCenterComponent } from './notification-center/notification-center.component';
import { ComposeMessageComponent } from './compose-message/compose-message.component';
import { MessagesListComponent } from './messages-list/messages-list.component';
import { InboxComponent } from './inbox/inbox.component';

@NgModule({
	declarations: [
		MessagingComponent,
		ConversationListComponent,
		ChatWindowComponent,
		MessageComposerComponent,
		NotificationCenterComponent,
  ComposeMessageComponent,
  MessagesListComponent,
  InboxComponent
	],
	imports: [
		CommonModule,
		MessagingRoutingModule,
		ReactiveFormsModule,
		FormsModule,

		// Shared Module
		SharedModule,


		QuillModule.forRoot(),
		

		// Angular Material
		MatCardModule,
		MatButtonModule,
		MatIconModule,
		MatInputModule,
		MatFormFieldModule,
		MatListModule,
		MatDividerModule,
		MatBadgeModule,
		MatMenuModule,
		MatTooltipModule,
		MatChipsModule,
		MatProgressBarModule,
		MatSnackBarModule,
		MatDialogModule,
		MatTabsModule,
		MatExpansionModule,
		MatSlideToggleModule,
		MatProgressBarModule,
		MatProgressSpinnerModule,
		MatOptionModule,

		// Charts
		BaseChartDirective
	],
	providers: [
		provideCharts(withDefaultRegisterables())
	]
})
export class MessagingModule { }
