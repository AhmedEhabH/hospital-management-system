import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { SignalRService, ChatMessage, Notification } from '../../core/services/signalr.service';
import { MessageService, Message, Conversation } from '../../core/services/message.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
	selector: 'app-messaging',
	standalone:false,
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
	messages: Message[] = [];
	newMessage = '';

	// Real-time Data
	onlineUsers: any[] = [];
	notifications: Notification[] = [];
	unreadCount = 0;

	constructor(
		private signalRService: SignalRService,
		private messageService: MessageService,
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
			await this.signalRService.requestNotificationPermission();
			await this.signalRService.startConnection();
			this.isConnected = true;

			this.signalRService.connectionState$
				.pipe(takeUntil(this.destroy$))
				.subscribe(state => {
					this.isConnected = state === 'Connected';
				});

			// FIXED: Handle ChatMessage and convert to Message
			this.signalRService.messageReceived$
				.pipe(takeUntil(this.destroy$))
				.subscribe((chatMessage: ChatMessage) => {
					// Convert ChatMessage to Message for consistency
					const message = this.messageService.convertChatMessageToMessage(chatMessage);
					this.handleIncomingMessage(message);
				});

			this.signalRService.notificationReceived$
				.pipe(takeUntil(this.destroy$))
				.subscribe((notification: Notification) => {
					this.handleNotification(notification);
				});

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

		this.messageService.getConversations()
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

	// FIXED: Handle Message type instead of ChatMessage
	private handleIncomingMessage(message: Message): void {
		if (this.activeConversation && message.conversationId === this.activeConversation.id) {
			this.messages.push(message);
			this.markMessageAsRead(message.id.toString());
		}

		this.messageService.updateConversationLastMessage(message.conversationId!, message);

		if (!this.activeConversation || message.conversationId !== this.activeConversation.id) {
			this.showMessageNotification(message);
		}
	}

	private handleNotification(notification: Notification): void {
		this.notifications.unshift(notification);

		if (notification.priority === 'high' || notification.priority === 'critical') {
			this.showNotificationSnackbar(notification);
		}
	}

	// FIXED: Update sendMessage method with proper type handling
	async sendMessage(): Promise<void> {
		if (!this.newMessage.trim() || !this.activeConversation || !this.isConnected) {
			return;
		}

		const messageText = this.newMessage.trim();
		this.newMessage = '';

		try {
			// FIXED: Handle Message type properly
			this.messageService.sendMessage(
				this.activeConversation.id,
				messageText,
				'text'
			).pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (sentMessage: Message) => {
						// FIXED: Use Message type directly
						this.messages.push(sentMessage);
						this.messageService.updateConversationLastMessage(this.activeConversation!.id, sentMessage);

						// Convert to ChatMessage for SignalR
						const chatMessage = this.messageService.convertMessageToChatMessage(sentMessage);
						this.signalRService.sendMessage({
							senderId: chatMessage.senderId,
							senderName: chatMessage.senderName,
							receiverId: chatMessage.receiverId,
							receiverName: chatMessage.receiverName,
							message: chatMessage.message,
							conversationId: chatMessage.conversationId,
							messageType: chatMessage.messageType,
							isRead: chatMessage.isRead
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
		this.messageService.setActiveConversation(conversation);
		this.loadMessages(conversation.id);

		// FIXED: Use correct method name
		this.messageService.resetUnreadCount(conversation.id);
	}

	private loadMessages(conversationId: string): void {
		// FIXED: Handle Message[] type properly
		this.messageService.getMessages(conversationId)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (messages: Message[]) => {
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
			.map(msg => msg.id.toString());

		if (unreadMessageIds.length > 0) {
			// FIXED: Use correct method name
			this.messageService.markMessagesAsRead(this.activeConversation.id, unreadMessageIds)
				.pipe(takeUntil(this.destroy$))
				.subscribe();
		}
	}

	private markMessageAsRead(messageId: string): void {
		this.signalRService.markMessageAsRead(messageId);
	}

	onFileSelected(event: any): void {
		const files = event.target.files;
		if (files && files.length > 0) {
			this.uploadFiles(Array.from(files));
		}
	}

	private uploadFiles(files: File[]): void {
		files.forEach(file => {
			this.messageService.uploadAttachment(file)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (attachment) => {
						if (this.activeConversation) {
							this.messageService.sendMessage(
								this.activeConversation.id,
								`File: ${attachment.fileName}`,
								'file'
							).subscribe();
						}
					},
					error: (error) => {
						console.error('Error uploading file:', error);
						this.showErrorMessage('Failed to upload file');
					}
				});
		});
	}

	// FIXED: Update notification methods to use Message type
	private showMessageNotification(message: Message): void {
		this.snackBar.open(
			`New message from ${message.senderName}: ${message.messageContent}`,
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

	isMyMessage(message: Message): boolean {
		return message.senderId === this.currentUser?.id;
	}

	getConnectionStatusClass(): string {
		return this.isConnected ? 'connected' : 'disconnected';
	}

	getConnectionStatusText(): string {
		return this.isConnected ? 'Connected' : 'Disconnected';
	}
}
