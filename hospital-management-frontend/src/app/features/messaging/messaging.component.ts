import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil, interval } from 'rxjs';
import { MessageService, Message } from '../../core/services/message.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
	selector: 'app-messaging',
	standalone: false,
	templateUrl: './messaging.component.html',
	styleUrls: ['./messaging.component.scss']
})
export class MessagingComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();

	currentUser: any;
	isDarkMode = false;
	isLoading = true;

	// Messages Data
	messages: Message[] = [];
	conversations: any[] = [];
	selectedConversation: any = null;
	unreadCount = 0;

	// Real-time updates
	private messagePolling$ = interval(30000); // Poll every 30 seconds

	constructor(
		private messageService: MessageService,
		private authService: AuthService,
		private themeService: ThemeService
	) { }

	ngOnInit(): void {
		this.initializeComponent();
		this.subscribeToTheme();
		this.loadMessages();
		this.startRealTimeUpdates();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private initializeComponent(): void {
		this.currentUser = this.authService.getCurrentUser();
	}

	private subscribeToTheme(): void {
		this.themeService.isDarkMode$
			.pipe(takeUntil(this.destroy$))
			.subscribe(isDark => {
				this.isDarkMode = isDark;
			});
	}

	private loadMessages(): void {
		this.isLoading = true;

		if (this.currentUser) {
			this.messageService.getInbox(this.currentUser.id)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (messages: Message[]) => {
						this.messages = messages;
						this.unreadCount = messages.filter(m => !m.isRead).length;
						this.organizeConversations(messages);
						this.isLoading = false;
					},
					error: (error: any) => {
						console.error('Error loading messages:', error);
						this.isLoading = false;
					}
				});
		}
	}

	private organizeConversations(messages: Message[]): void {
		// Group messages by sender/receiver to create conversations
		const conversationMap = new Map();

		messages.forEach(message => {
			const otherUserId = message.senderId === this.currentUser.id
				? message.receiverId
				: message.senderId;

			if (!conversationMap.has(otherUserId)) {
				conversationMap.set(otherUserId, {
					userId: otherUserId,
					messages: [],
					lastMessage: null,
					unreadCount: 0
				});
			}

			const conversation = conversationMap.get(otherUserId);
			conversation.messages.push(message);

			if (!message.isRead && message.receiverId === this.currentUser.id) {
				conversation.unreadCount++;
			}

			// Update last message
			if (!conversation.lastMessage ||
				new Date(message.sentDate!) > new Date(conversation.lastMessage.sentDate!)) {
				conversation.lastMessage = message;
			}
		});

		this.conversations = Array.from(conversationMap.values())
			.sort((a, b) => new Date(b.lastMessage.sentDate).getTime() - new Date(a.lastMessage.sentDate).getTime());
	}

	private startRealTimeUpdates(): void {
		this.messagePolling$
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				this.loadMessages();
			});
	}

	selectConversation(conversation: any): void {
		this.selectedConversation = conversation;

		// Mark messages as read
		const unreadMessages = conversation.messages.filter(
			(m: Message) => !m.isRead && m.receiverId === this.currentUser.id
		);

		unreadMessages.forEach((message: Message) => {
			if (message.id) {
				this.messageService.markAsRead(message.id).subscribe();
				message.isRead = true;
			}
		});

		conversation.unreadCount = 0;
		this.updateUnreadCount();
	}

	private updateUnreadCount(): void {
		this.unreadCount = this.conversations.reduce((total, conv) => total + conv.unreadCount, 0);
	}

	sendMessage(content: string, receiverId: number): void {
		const newMessage: Message = {
			senderId: this.currentUser.id,
			receiverId: receiverId,
			subject: 'Direct Message',
			messageContent: content,
			isRead: false,
			sentDate: new Date()
		};

		this.messageService.sendMessage(newMessage)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (sentMessage: Message) => {
					// Add to conversation
					if (this.selectedConversation) {
						this.selectedConversation.messages.push(sentMessage);
						this.selectedConversation.lastMessage = sentMessage;
					}
				},
				error: (error: any) => {
					console.error('Error sending message:', error);
				}
			});
	}

	getMessageTime(date: Date): string {
		const now = new Date();
		const messageDate = new Date(date);
		const diffInHours = Math.abs(now.getTime() - messageDate.getTime()) / 36e5;

		if (diffInHours < 24) {
			return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		} else {
			return messageDate.toLocaleDateString();
		}
	}

	isMyMessage(message: Message): boolean {
		return message.senderId === this.currentUser.id;
	}
}
