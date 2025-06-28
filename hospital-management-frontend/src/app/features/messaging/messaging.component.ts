import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { SignalrService } from '../../core/services/signalr.service';
import { MessageService, Message, Conversation } from '../../core/services/message.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChatMessage, ConversationItem, NotificationData, UserPresence } from '../../core/models/dtos';

interface InternalNotification {
	id: string;
	title: string;
	message: string;
	type: 'medical' | 'appointment' | 'emergency' | 'system';
	priority: 'critical' | 'high' | 'medium' | 'low';
	timestamp: Date;
	read: boolean;
	actionUrl?: string;
}

@Component({
	selector: 'app-messaging',
	standalone: false,
	templateUrl: './messaging.component.html',
	styleUrls: ['./messaging.component.scss']
})


export class MessagingComponent implements OnInit, OnDestroy {
	// FIXED: Add all missing properties
	isDarkMode = false;
	isLoading = false;
	isConnected = false;
	conversations: ConversationItem[] = [];
	activeConversation: ConversationItem | null = null;

	notifications: InternalNotification[] = [];
	unreadCount = 0;
	selectedConversationId: string | null = null;
	showNotifications = false;
	onlineUsers: UserPresence[] = [];

	private subscriptions: Subscription[] = [];

	constructor(private SignalrService: SignalrService) { }

	ngOnInit(): void {
		// FIXED: Initialize all properties
		this.isDarkMode = document.body.classList.contains('dark-theme');
		this.isLoading = true;

		this.loadConversations();
		this.subscribeToMessages();
		this.subscribeToNotifications();
		// this.subscribeToOnlineUsers();
		this.subscribeToConnectionState();
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}

	private loadConversations(): void {
		// TODO: Load conversations from API
		// Mock data for now
		this.conversations = [
			{
				id: 'conv_1',
				title: 'Dr. Smith - Cardiology',
				lastMessage: 'Your test results look good.',
				lastMessageTime: new Date(),
				unreadCount: 2,
				participants: [{ id: 1, name: 'Dr. Smith', type: 'Doctor' }],
				isOnline: true,
				conversationType: 'direct'
			},
			{
				id: 'conv_2',
				title: 'Medical Team Chat',
				lastMessage: 'Emergency patient in room 302',
				lastMessageTime: new Date(Date.now() - 1800000),
				unreadCount: 5,
				participants: [
					{ id: 1, name: 'Dr. Smith', type: 'Doctor' },
					{ id: 2, name: 'Nurse Johnson', type: 'Nurse' }
				],
				isOnline: true,
				conversationType: 'group'
			}
		];
		this.isLoading = false;
	}

	private subscribeToConnectionState(): void {
		this.subscriptions.push(
			this.SignalrService.connectionState$.subscribe(state => {
				this.isConnected = state === 'Connected';
			})
		);
	}

	private subscribeToMessages(): void {
		this.subscriptions.push(
			this.SignalrService.messageReceived$
				.subscribe((message: ChatMessage | null) => {
					if (message) {
						this.handleIncomingMessage(message);
					}
				})
		);
	}

	private subscribeToNotifications(): void {
		this.subscriptions.push(
			this.SignalrService.notificationReceived$
				.subscribe((notificationData: NotificationData | null) => {
					if (notificationData) {
						this.handleIncomingNotification(notificationData);
					}
				})
		);
	}

	// private subscribeToOnlineUsers(): void {
	// 	this.subscriptions.push(
	// 		this.SignalrService.onlineUsers$
	// 			.subscribe((users: UserPresence[]) => {
	// 				this.onlineUsers = users;
	// 			})
	// 	);
	// }

	private handleIncomingMessage(message: ChatMessage): void {
		console.log('New message received:', message);

		const notification: InternalNotification = {
			id: `msg_notif_${Date.now()}`,
			title: 'New Message',
			message: `You have a new message: ${message.content.substring(0, 50)}...`,
			type: 'system',
			priority: 'medium',
			timestamp: new Date(),
			read: false,
			actionUrl: `/messaging/chat/${message.conversationId}`
		};

		this.addNotification(notification);
	}

	private handleIncomingNotification(notificationData: NotificationData): void {
		const notification: InternalNotification = {
			id: `notif_${Date.now()}`,
			title: notificationData.title,
			message: notificationData.message,
			type: notificationData.type,
			priority: notificationData.priority,
			timestamp: new Date(notificationData.timestamp),
			read: false,
			actionUrl: notificationData.actionUrl
		};

		this.addNotification(notification);

		if (notification.priority === 'critical' || notification.priority === 'high') {
			this.showBrowserNotification(notification);
		}
	}

	private addNotification(notification: InternalNotification): void {
		this.notifications.unshift(notification);
		this.updateUnreadCount();
	}

	private updateUnreadCount(): void {
		this.unreadCount = this.notifications.filter(n => !n.read).length;
	}

	private showBrowserNotification(notification: InternalNotification): void {
		if ('Notification' in window && Notification.permission === 'granted') {
			const browserNotification = new Notification(notification.title, {
				body: notification.message,
				icon: '/assets/icons/medical-alert.png'
			});

			browserNotification.onclick = () => {
				if (notification.actionUrl) {
					window.location.href = notification.actionUrl;
				}
				browserNotification.close();
			};
		}
	}

	// FIXED: Add all missing methods
	public getConnectionStatusClass(): string {
		return this.isConnected ? 'status-connected' : 'status-disconnected';
	}

	public getConnectionStatusText(): string {
		return this.isConnected ? 'Connected' : 'Disconnected';
	}

	public formatMessageTime(timestamp: Date): string {
		const now = new Date();
		const diff = now.getTime() - timestamp.getTime();
		const minutes = Math.floor(diff / 60000);

		if (minutes < 1) return 'Just now';
		if (minutes < 60) return `${minutes}m ago`;
		if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
		return timestamp.toLocaleDateString();
	}

	public selectConversation(conversation: ConversationItem): void {
		this.activeConversation = conversation;
		this.selectedConversationId = conversation.id;
	}

	public toggleNotifications(): void {
		this.showNotifications = !this.showNotifications;
	}

	public markNotificationAsRead(notificationId: string): void {
		const notification = this.notifications.find(n => n.id === notificationId);
		if (notification) {
			notification.read = true;
			this.updateUnreadCount();
		}
	}

	public markAllAsRead(): void {
		this.notifications.forEach(n => n.read = true);
		this.updateUnreadCount();
	}

	public clearNotification(notificationId: string): void {
		this.notifications = this.notifications.filter(n => n.id !== notificationId);
		this.updateUnreadCount();
	}

	public clearAllNotifications(): void {
		this.notifications = [];
		this.updateUnreadCount();
	}

	public getNotificationIcon(type: string): string {
		switch (type) {
			case 'medical': return 'local_hospital';
			case 'appointment': return 'event';
			case 'emergency': return 'warning';
			case 'system': return 'info';
			default: return 'notifications';
		}
	}

	public getNotificationClass(priority: string): string {
		switch (priority) {
			case 'critical': return 'notification-critical';
			case 'high': return 'notification-high';
			case 'medium': return 'notification-medium';
			case 'low': return 'notification-low';
			default: return 'notification-info';
		}
	}

	public formatNotificationTime(timestamp: Date): string {
		const now = new Date();
		const diff = now.getTime() - timestamp.getTime();
		const minutes = Math.floor(diff / 60000);

		if (minutes < 1) return 'Just now';
		if (minutes < 60) return `${minutes}m ago`;
		if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
		return timestamp.toLocaleDateString();
	}

	public handleNotificationAction(notification: InternalNotification): void {
		this.markNotificationAsRead(notification.id);
		if (notification.actionUrl) {
			window.location.href = notification.actionUrl;
		}
	}
}
