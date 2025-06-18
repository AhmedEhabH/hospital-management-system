import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MessageService, Conversation } from '../../../core/services/message.service';
import { SignalRService, UserPresence } from '../../../core/services/signalr.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
	selector: 'app-conversation-list',
	standalone: false,
	templateUrl: './conversation-list.component.html',
	styleUrls: ['./conversation-list.component.scss']
})
export class ConversationListComponent implements OnInit, OnDestroy {
	@Input() conversations: Conversation[] = [];
	@Input() activeConversation: Conversation | null = null;
	@Output() conversationSelected = new EventEmitter<Conversation>();
	@Output() newConversation = new EventEmitter<void>();

	private destroy$ = new Subject<void>();

	isDarkMode = false;
	isLoading = false;
	searchTerm = '';
	filteredConversations: Conversation[] = [];
	onlineUsers: UserPresence[] = [];
	currentUser: any;

	constructor(
		private messagingService: MessageService,
		private signalRService: SignalRService,
		private themeService: ThemeService,
		private authService: AuthService
	) { }

	ngOnInit(): void {
		this.currentUser = this.authService.getCurrentUser();
		this.subscribeToTheme();
		this.subscribeToOnlineUsers();
		this.filteredConversations = [...this.conversations];
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	ngOnChanges(): void {
		this.applyFilter();
	}

	private subscribeToTheme(): void {
		this.themeService.isDarkMode$
			.pipe(takeUntil(this.destroy$))
			.subscribe(isDark => {
				this.isDarkMode = isDark;
			});
	}

	private subscribeToOnlineUsers(): void {
		this.signalRService.onlineUsers$
			.pipe(takeUntil(this.destroy$))
			.subscribe(users => {
				this.onlineUsers = users;
			});
	}

	onSearchChange(): void {
		this.applyFilter();
	}

	private applyFilter(): void {
		if (!this.searchTerm.trim()) {
			this.filteredConversations = [...this.conversations];
		} else {
			const searchLower = this.searchTerm.toLowerCase();
			this.filteredConversations = this.conversations.filter(conversation =>
				conversation.title?.toLowerCase().includes(searchLower) ||
				conversation.participants.some(p =>
					p.userName.toLowerCase().includes(searchLower)
				) ||
				conversation.lastMessage?.message.toLowerCase().includes(searchLower)
			);
		}
	}

	onConversationClick(conversation: Conversation): void {
		this.conversationSelected.emit(conversation);
	}

	onNewConversationClick(): void {
		this.newConversation.emit();
	}

	// ENHANCED: Better null safety for isUserOnline method
	isUserOnline(userId: number | undefined): boolean {
		if (!userId) {
			return false;
		}
		return this.onlineUsers.some(user => user.userId === userId && user.isOnline);
	}

	getLastMessagePreview(conversation: Conversation): string {
		if (!conversation.lastMessage) {
			return 'No messages yet';
		}

		const message = conversation.lastMessage.message;
		return message.length > 50 ? message.substring(0, 50) + '...' : message;
	}

	formatLastMessageTime(conversation: Conversation): string {
		if (!conversation.lastMessageAt) {
			return '';
		}

		const now = new Date();
		const messageTime = new Date(conversation.lastMessageAt);
		const diffInHours = Math.abs(now.getTime() - messageTime.getTime()) / 36e5;

		if (diffInHours < 1) {
			return 'Just now';
		} else if (diffInHours < 24) {
			return messageTime.toLocaleTimeString('en-US', {
				hour: '2-digit',
				minute: '2-digit'
			});
		} else if (diffInHours < 168) { // Less than a week
			return messageTime.toLocaleDateString('en-US', {
				weekday: 'short'
			});
		} else {
			return messageTime.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric'
			});
		}
	}

	getConversationParticipants(conversation: Conversation): string {
		if (!conversation.participants || conversation.participants.length === 0) {
			return 'Unknown';
		}

		const otherParticipants = conversation.participants.filter(p =>
			p.userId !== this.currentUser?.id
		);

		if (otherParticipants.length === 1) {
			return otherParticipants[0].userName;
		} else if (otherParticipants.length > 1) {
			return `${otherParticipants[0].userName} +${otherParticipants.length - 1}`;
		}

		return 'Unknown';
	}

	getConversationIcon(conversation: Conversation): string {
		switch (conversation.conversationType) {
			case 'group':
				return 'group';
			case 'medical_team':
				return 'medical_services';
			default:
				return 'person';
		}
	}

	getUnreadCountDisplay(count: number): string {
		return count > 99 ? '99+' : count.toString();
	}
}
