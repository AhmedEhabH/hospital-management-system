import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { SignalRService, ChatMessage, Notification } from '../../core/services/signalr.service';
import { MessageService, Conversation } from '../../core/services/message.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
	isConnected = false;

	// Messaging Data
	conversations: Conversation[] = [];
	activeConversation: Conversation | null = null;
	messages: ChatMessage[] = [];
	newMessage = '';

	// Real-time Data
	onlineUsers: any[] = [];
	notifications: Notification[] = [];
	unreadCount = 0;

	constructor(
		private signalRService: SignalRService,
		private messagingService: MessageService,
		private authService: AuthService,
		private themeService: ThemeService,
		private snackBar: MatSnackBar
	) { }

	ngOnInit(): void {
		this.initializeComponent();
		this.subscribeToTheme();
		this.initializeSignalR();
		this.loadConversations();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
		this.signalRService.stopConnection();
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

	private async initializeSignalR(): Promise<void> {
		try {
			// Request notification permission
			await this.signalRService.requestNotificationPermission();

			// Start SignalR connection
			await this.signalRService.startConnection();
			this.isConnected = true;

			// Subscribe to connection state
			this.signalRService.connectionState$
				.pipe(takeUntil(this.destroy$))
				.subscribe(state => {
					this.isConnected = state === 'Connected';
				});

			// Subscribe to real-time messages
			this.signalRService.messageReceived$
				.pipe(takeUntil(this.destroy$))
				.subscribe((message: ChatMessage) => {
					this.handleIncomingMessage(message);
				});

			// Subscribe to notifications
			this.signalRService.notificationReceived$
				.pipe(takeUntil(this.destroy$))
				.subscribe((notification: Notification) => {
					this.handleNotification(notification);
				});

			// Subscribe to online users
			this.signalRService.onlineUsers$
				.pipe(takeUntil(this.destroy$))
				.subscribe(users => {
					this.onlineUsers = users;
				});

		} catch (error) {
			console.error('Error initializing SignalR:', error);
			this.showErrorMessage('Failed to connect to real-time messaging');
		}
	}

	private loadConversations(): void {
		this.isLoading = true;

		this.messagingService.getConversations()
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (conversations: Conversation[]) => {
					this.conversations = conversations;
					this.calculateUnreadCount();
					this.isLoading = false;
				},
				error: (error: any) => {
					console.error('Error loading conversations:', error);
					this.isLoading = false;
					this.showErrorMessage('Failed to load conversations');
				}
			});
	}

	private calculateUnreadCount(): void {
		this.unreadCount = this.conversations.reduce((total, conv) => total + conv.unreadCount, 0);
	}

	// Message handling methods
	private handleIncomingMessage(message: ChatMessage): void {
		// Add message to current conversation if it matches
		if (this.activeConversation && message.conversationId === this.activeConversation.id) {
			this.messages.push(message);
			// Mark as read if conversation is active
			this.markMessageAsRead(message.id);
		}

		// Update conversation list
		this.messagingService.updateConversationLastMessage(message.conversationId, message);

		// Show notification if not in active conversation
		if (!this.activeConversation || message.conversationId !== this.activeConversation.id) {
			this.showMessageNotification(message);
		}
	}

	private handleNotification(notification: Notification): void {
		this.notifications.unshift(notification);

		// Show snackbar for important notifications
		if (notification.priority === 'high' || notification.priority === 'critical') {
			this.showNotificationSnackbar(notification);
		}
	}

	// FIXED: Correct sendMessage method call with proper arguments
	async sendMessage(): Promise<void> {
		if (!this.newMessage.trim() || !this.activeConversation || !this.isConnected) {
			return;
		}

		const messageText = this.newMessage.trim();
		this.newMessage = '';

		try {
			// FIXED: Use messagingService.sendMessage with correct parameters
			this.messagingService.sendMessage(
				this.activeConversation.id,
				messageText,
				'text'
			).pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (sentMessage: ChatMessage) => {
						// FIXED: Handle ChatMessage type correctly
						this.messages.push(sentMessage);
						this.messagingService.updateConversationLastMessage(this.activeConversation!.id, sentMessage);

						// Send via SignalR for real-time delivery
						this.signalRService.sendMessage({
							senderId: sentMessage.senderId,
							senderName: sentMessage.senderName,
							receiverId: sentMessage.receiverId,
							receiverName: sentMessage.receiverName,
							message: sentMessage.message,
							conversationId: sentMessage.conversationId,
							messageType: sentMessage.messageType,
							isRead: sentMessage.isRead
						});
					},
					error: (error: any) => {
						console.error('Error sending message:', error);
						this.showErrorMessage('Failed to send message');
					}
				});

		} catch (error) {
			console.error('Error sending message:', error);
			this.showErrorMessage('Failed to send message');
		}
	}

	selectConversation(conversation: Conversation): void {
		this.activeConversation = conversation;
		this.messagingService.setActiveConversation(conversation);
		this.loadMessages(conversation.id);

		// Reset unread count for this conversation
		this.messagingService.resetUnreadCount(conversation.id);
	}

	private loadMessages(conversationId: string): void {
		this.messagingService.getMessages(conversationId)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (messages: ChatMessage[]) => {
					this.messages = messages;
					this.markAllMessagesAsRead();
				},
				error: (error: any) => {
					console.error('Error loading messages:', error);
					this.showErrorMessage('Failed to load messages');
				}
			});
	}

	private markAllMessagesAsRead(): void {
		if (!this.activeConversation) return;

		const unreadMessageIds = this.messages
			.filter(msg => !msg.isRead && msg.receiverId === this.currentUser?.id)
			.map(msg => msg.id);

		if (unreadMessageIds.length > 0) {
			this.messagingService.markMessagesAsRead(this.activeConversation.id, unreadMessageIds)
				.pipe(takeUntil(this.destroy$))
				.subscribe();
		}
	}

	private markMessageAsRead(messageId: string): void {
		this.signalRService.markMessageAsRead(messageId);
	}

	// File handling methods
	onFileSelected(event: any): void {
		const files = event.target.files;
		if (files && files.length > 0) {
			this.uploadFiles(Array.from(files));
		}
	}

	private uploadFiles(files: File[]): void {
		files.forEach(file => {
			this.messagingService.uploadAttachment(file)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (attachment:any) => {
						// Send file message
						if (this.activeConversation) {
							this.messagingService.sendMessage(
								this.activeConversation.id,
								`File: ${attachment.fileName}`,
								'file'
							).subscribe();
						}
					},
					error: (error:any) => {
						console.error('Error uploading file:', error);
						this.showErrorMessage('Failed to upload file');
					}
				});
		});
	}

	// Notification methods
	private showMessageNotification(message: ChatMessage): void {
		this.snackBar.open(
			`New message from ${message.senderName}: ${message.message}`,
			'View',
			{
				duration: 5000,
				horizontalPosition: 'end',
				verticalPosition: 'top'
			}
		);
	}

	private showNotificationSnackbar(notification: Notification): void {
		this.snackBar.open(
			`${notification.title}: ${notification.message}`,
			'Close',
			{
				duration: 5000,
				panelClass: notification.priority === 'critical' ? ['error-snackbar'] : ['info-snackbar'],
				horizontalPosition: 'end',
				verticalPosition: 'top'
			}
		);
	}

	private showErrorMessage(message: string): void {
		this.snackBar.open(message, 'Close', {
			duration: 5000,
			panelClass: ['error-snackbar'],
			horizontalPosition: 'end',
			verticalPosition: 'top'
		});
	}

	// Utility methods
	formatMessageTime(timestamp: Date): string {
		const now = new Date();
		const messageTime = new Date(timestamp);
		const diffInHours = Math.abs(now.getTime() - messageTime.getTime()) / 36e5;

		if (diffInHours < 1) {
			return 'Just now';
		} else if (diffInHours < 24) {
			return messageTime.toLocaleTimeString('en-US', {
				hour: '2-digit',
				minute: '2-digit'
			});
		} else {
			return messageTime.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric'
			});
		}
	}

	isMyMessage(message: ChatMessage): boolean {
		return message.senderId === this.currentUser?.id;
	}

	getConnectionStatusClass(): string {
		return this.isConnected ? 'connected' : 'disconnected';
	}

	getConnectionStatusText(): string {
		return this.isConnected ? 'Connected' : 'Disconnected';
	}
}
