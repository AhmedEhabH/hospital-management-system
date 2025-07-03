import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SignalrService } from '../../../core/services/signalr.service';
import { ConversationItem, Message, UserPresence } from '../../../core/models/dtos';


@Component({
	selector: 'app-conversation-list',
	standalone: false,
	templateUrl: './conversation-list.component.html',
	styleUrls: ['./conversation-list.component.scss']
})


export class ConversationListComponent implements OnInit, OnDestroy {
	// FIXED: Add all missing properties
	isDarkMode = false;
	searchTerm = '';
	conversations: ConversationItem[] = [];
	filteredConversations: ConversationItem[] = [];
	onlineUsers: UserPresence[] = [];
	loading = false;
	activeConversation: string | null = null; // FIXED: Add missing property

	private subscriptions: Subscription[] = [];

	constructor(
		private SignalrService: SignalrService,
		private router: Router
	) { }

	ngOnInit(): void {
		this.isDarkMode = document.body.classList.contains('dark-theme');
		this.loadConversations();
		// this.subscribeToOnlineUsers();
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}

	private loadConversations(): void {
		this.loading = true;
		// TODO: Load conversations from API
		// Mock data for now
		this.conversations = [
			{
				id: 'conv_1',
				title: 'Dr. Smith - Cardiology',
				lastMessage: 'Your test results look good.',
				lastMessageAt: new Date(),
				unreadCount: 2,
				participants: [{ id: 1, name: 'Dr. Smith', type: 'Doctor' }],
				isOnline: true,
				conversationType: 'private' // FIXED: Add missing property
			},
			{
				id: 'conv_2',
				title: 'Nurse Johnson',
				lastMessage: 'Please remember your appointment tomorrow.',
				lastMessageAt: new Date(Date.now() - 3600000),
				unreadCount: 0,
				participants: [{ id: 2, name: 'Nurse Johnson', type: 'Nurse' }],
				isOnline: false,
				conversationType: 'private' // FIXED: Add missing property
			},
			{
				id: 'conv_3',
				title: 'Medical Team Chat',
				lastMessage: 'Emergency patient in room 302',
				lastMessageAt: new Date(Date.now() - 1800000),
				unreadCount: 5,
				participants: [
					{ id: 1, name: 'Dr. Smith', type: 'Doctor' },
					{ id: 2, name: 'Nurse Johnson', type: 'Nurse' },
					{ id: 3, name: 'Dr. Wilson', type: 'Doctor' }
				],
				isOnline: true,
				conversationType: 'group' // FIXED: Add missing property
			}
		];
		this.filteredConversations = [...this.conversations];
		this.loading = false;
	}

	// private subscribeToOnlineUsers(): void {
	// 	this.subscriptions.push(
	// 		this.SignalrService.onlineUsers$
	// 			.subscribe((users: UserPresence[]) => {
	// 				this.onlineUsers = users;
	// 				this.updateConversationOnlineStatus();
	// 			})
	// 	);
	// }

	private updateConversationOnlineStatus(): void {
		this.conversations.forEach(conversation => {
			conversation.isOnline = conversation.participants.some(participant =>
				this.onlineUsers.some(user => user.userId === participant.id && user.isOnline)
			);
		});
		this.applyFilter();
	}

	// FIXED: Add all missing methods
	public onNewConversationClick(): void {
		this.router.navigate(['/messaging/new']);
	}

	public onSearchChange(): void {
		this.applyFilter();
	}
	private returnMessageContent(message: string | Message | null | undefined):string{
		if (!message) {
			return '';
		}
		if(typeof(message) === 'string'){
			return message;
		}
		return message.messageContent;
	}

	
	private applyFilter(): void {
		if (!this.searchTerm.trim()) {
			this.filteredConversations = [...this.conversations];
		} else {
			const searchLower = this.searchTerm.toLowerCase();
			this.filteredConversations = this.conversations.filter(conversation =>
				conversation.title.toLowerCase().includes(searchLower) ||
				this.returnMessageContent(conversation.lastMessage).toLowerCase().includes(searchLower)
			);
		}
	}

	public openConversation(conversationId: string): void {
		this.activeConversation = conversationId;
		this.router.navigate(['/messaging/chat', conversationId]);
	}

	// FIXED: Add missing method
	public onConversationClick(conversation: ConversationItem): void {
		this.openConversation(conversation.id);
	}

	public isUserOnline(userId: number): boolean {
		return this.onlineUsers.some(user => user.userId === userId && user.isOnline);
	}

	public formatlastMessageAt(timestamp: Date): string {
		const now = new Date();
		const diff = now.getTime() - timestamp.getTime();
		const minutes = Math.floor(diff / 60000);

		if (minutes < 1) return 'Just now';
		if (minutes < 60) return `${minutes}m ago`;
		if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
		return timestamp.toLocaleDateString();
	}

	public getConversationIcon(conversation: ConversationItem): string {
		if (conversation.conversationType === 'group') return 'group';
		const participant = conversation.participants[0];
		if (participant?.type === 'Doctor') return 'local_hospital';
		if (participant?.type === 'Nurse') return 'medical_services';
		return 'person';
	}

	// FIXED: Add missing method
	public getConversationParticipants(conversation: ConversationItem): string {
		if (conversation.conversationType === 'group') {
			return `${conversation.participants.length} participants`;
		}
		return conversation.participants[0]?.name || 'Unknown';
	}

	// FIXED: Add missing method
	public getLastMessagePreview(conversation: ConversationItem): string {
		const maxLength = 50;
		if (conversation.lastMessage) {
			if (typeof (conversation.lastMessage) === 'string') {
				if (conversation.lastMessage.length > maxLength)
					return conversation.lastMessage.substring(0, maxLength) + '...';
				else
					return conversation.lastMessage;
			} else {
				if (conversation.lastMessage.messageContent.length > maxLength) {
					return conversation.lastMessage.messageContent.substring(0, maxLength) + '...';
				} else {
					return conversation.lastMessage.messageContent
				}
			}
		}
		return 'No messages yet';
	}
	// FIXED: Add missing method
	public getUnreadCountDisplay(conversation: ConversationItem): string {
		if (!conversation.unreadCount) return '';
		if (conversation.unreadCount === 0) return '';
		if (conversation.unreadCount && conversation.unreadCount > 99) return '99+';
		return conversation.unreadCount.toString();
	}

	// Getter for template compatibility
	get isLoading(): boolean {
		return this.loading;
	}
}

