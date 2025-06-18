import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

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

// Shared Module
import { SharedModule } from '../../shared/shared.module';

import { MessagingRoutingModule } from './messaging-routing.module';
import { MessagingComponent } from './messaging.component';
import { ConversationListComponent } from './conversation-list/conversation-list.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { MessageComposerComponent } from './message-composer/message-composer.component';
import { NotificationCenterComponent } from './notification-center/notification-center.component';

@NgModule({
	declarations: [
		MessagingComponent,
		ConversationListComponent,
		ChatWindowComponent,
		MessageComposerComponent,
		NotificationCenterComponent
	],
	imports: [
		CommonModule,
		MessagingRoutingModule,
		ReactiveFormsModule,
		FormsModule,

		// Shared Module
		SharedModule,

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
		MatSlideToggleModule
	]
})
export class MessagingModule { }
