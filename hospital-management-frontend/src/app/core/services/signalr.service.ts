import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface ChatMessage {
	id: string;
	senderId: number;
	senderName: string;
	receiverId: number;
	receiverName: string;
	message: string;
	timestamp: Date;
	messageType: 'text' | 'image' | 'file' | 'system';
	isRead: boolean;
	conversationId: string;
	attachmentUrl?: string;
	attachmentName?: string;
}

export interface Notification {
	id: string;
	userId: number;
	title: string;
	message: string;
	type: 'info' | 'warning' | 'error' | 'success' | 'medical' | 'appointment' | 'lab_result';
	priority: 'low' | 'medium' | 'high' | 'critical';
	timestamp: Date;
	isRead: boolean;
	actionUrl?: string;
	data?: any;
}

export interface UserPresence {
	userId: number;
	userName: string;
	isOnline: boolean;
	lastSeen: Date;
	currentActivity?: string;
}

@Injectable({
	providedIn: 'root'
})
export class SignalRService {
	private hubConnection: HubConnection | null = null;
	private connectionState = new BehaviorSubject<string>('Disconnected');

	// Message-related subjects
	private messageReceived = new Subject<ChatMessage>();
	private messageDelivered = new Subject<{ messageId: string; deliveredAt: Date }>();
	private messageRead = new Subject<{ messageId: string; readAt: Date }>();
	private typingIndicator = new Subject<{ userId: number; userName: string; isTyping: boolean }>();

	// Notification-related subjects
	private notificationReceived = new Subject<Notification>();
	private criticalAlert = new Subject<Notification>();

	// Presence-related subjects
	private userPresenceUpdated = new Subject<UserPresence>();
	private onlineUsers = new BehaviorSubject<UserPresence[]>([]);

	// Observables
	public connectionState$ = this.connectionState.asObservable();
	public messageReceived$ = this.messageReceived.asObservable();
	public messageDelivered$ = this.messageDelivered.asObservable();
	public messageRead$ = this.messageRead.asObservable();
	public typingIndicator$ = this.typingIndicator.asObservable();
	public notificationReceived$ = this.notificationReceived.asObservable();
	public criticalAlert$ = this.criticalAlert.asObservable();
	public userPresenceUpdated$ = this.userPresenceUpdated.asObservable();
	public onlineUsers$ = this.onlineUsers.asObservable();

	constructor(private authService: AuthService) { }

	public async startConnection(): Promise<void> {
		if (this.hubConnection?.state === 'Connected') {
			return;
		}

		const token = this.authService.getToken();
		if (!token) {
			throw new Error('No authentication token available');
		}

		this.hubConnection = new HubConnectionBuilder()
			.withUrl(`${environment.apiUrl}/hubs/communication`, {
				accessTokenFactory: () => token,
				skipNegotiation: true,
				transport: 1 // WebSockets
			})
			.withAutomaticReconnect([0, 2000, 10000, 30000])
			.configureLogging(LogLevel.Information)
			.build();

		// Connection state handlers
		this.hubConnection.onclose(() => {
			this.connectionState.next('Disconnected');
			console.log('SignalR connection closed');
		});

		this.hubConnection.onreconnecting(() => {
			this.connectionState.next('Reconnecting');
			console.log('SignalR reconnecting...');
		});

		this.hubConnection.onreconnected(() => {
			this.connectionState.next('Connected');
			console.log('SignalR reconnected');
			this.registerUser();
		});

		// Message handlers
		this.hubConnection.on('ReceiveMessage', (message: ChatMessage) => {
			this.messageReceived.next(message);
		});

		this.hubConnection.on('MessageDelivered', (messageId: string, deliveredAt: Date) => {
			this.messageDelivered.next({ messageId, deliveredAt });
		});

		this.hubConnection.on('MessageRead', (messageId: string, readAt: Date) => {
			this.messageRead.next({ messageId, readAt });
		});

		this.hubConnection.on('UserTyping', (userId: number, userName: string, isTyping: boolean) => {
			this.typingIndicator.next({ userId, userName, isTyping });
		});

		// Notification handlers
		this.hubConnection.on('ReceiveNotification', (notification: Notification) => {
			this.notificationReceived.next(notification);

			// Handle critical alerts separately
			if (notification.priority === 'critical') {
				this.criticalAlert.next(notification);
				this.showBrowserNotification(notification);
			}
		});

		// Presence handlers
		this.hubConnection.on('UserPresenceUpdated', (userPresence: UserPresence) => {
			this.userPresenceUpdated.next(userPresence);
			this.updateOnlineUsersList(userPresence);
		});

		this.hubConnection.on('OnlineUsersList', (users: UserPresence[]) => {
			this.onlineUsers.next(users);
		});

		try {
			await this.hubConnection.start();
			this.connectionState.next('Connected');
			console.log('SignalR connection established');
			await this.registerUser();
		} catch (error) {
			console.error('Error starting SignalR connection:', error);
			this.connectionState.next('Error');
			throw error;
		}
	}

	public async stopConnection(): Promise<void> {
		if (this.hubConnection) {
			await this.hubConnection.stop();
			this.connectionState.next('Disconnected');
		}
	}

	// Message methods
	public async sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<void> {
		if (this.hubConnection?.state === 'Connected') {
			await this.hubConnection.invoke('SendMessage', message);
		}
	}

	public async sendPrivateMessage(receiverId: number, message: string, messageType: string = 'text'): Promise<void> {
		if (this.hubConnection?.state === 'Connected') {
			await this.hubConnection.invoke('SendPrivateMessage', receiverId, message, messageType);
		}
	}

	public async markMessageAsRead(messageId: string): Promise<void> {
		if (this.hubConnection?.state === 'Connected') {
			await this.hubConnection.invoke('MarkMessageAsRead', messageId);
		}
	}

	public async sendTypingIndicator(receiverId: number, isTyping: boolean): Promise<void> {
		if (this.hubConnection?.state === 'Connected') {
			await this.hubConnection.invoke('SendTypingIndicator', receiverId, isTyping);
		}
	}

	// Notification methods
	public async sendNotification(notification: Omit<Notification, 'id' | 'timestamp'>): Promise<void> {
		if (this.hubConnection?.state === 'Connected') {
			await this.hubConnection.invoke('SendNotification', notification);
		}
	}

	public async sendCriticalAlert(userId: number, title: string, message: string, data?: any): Promise<void> {
		if (this.hubConnection?.state === 'Connected') {
			const notification: Omit<Notification, 'id' | 'timestamp'> = {
				userId,
				title,
				message,
				type: 'medical',
				priority: 'critical',
				isRead: false,
				data
			};
			await this.hubConnection.invoke('SendCriticalAlert', notification);
		}
	}

	// Presence methods
	private async registerUser(): Promise<void> {
		const currentUser = this.authService.getCurrentUser();
		if (this.hubConnection?.state === 'Connected' && currentUser) {
			await this.hubConnection.invoke('RegisterUser', currentUser.id, currentUser.firstName + ' ' + currentUser.lastName);
		}
	}

	public async updateUserActivity(activity: string): Promise<void> {
		if (this.hubConnection?.state === 'Connected') {
			await this.hubConnection.invoke('UpdateUserActivity', activity);
		}
	}

	// Group/Room methods
	public async joinGroup(groupName: string): Promise<void> {
		if (this.hubConnection?.state === 'Connected') {
			await this.hubConnection.invoke('JoinGroup', groupName);
		}
	}

	public async leaveGroup(groupName: string): Promise<void> {
		if (this.hubConnection?.state === 'Connected') {
			await this.hubConnection.invoke('LeaveGroup', groupName);
		}
	}

	public async sendGroupMessage(groupName: string, message: string): Promise<void> {
		if (this.hubConnection?.state === 'Connected') {
			await this.hubConnection.invoke('SendGroupMessage', groupName, message);
		}
	}

	// Utility methods
	private updateOnlineUsersList(userPresence: UserPresence): void {
		const currentUsers = this.onlineUsers.value;
		const existingUserIndex = currentUsers.findIndex(u => u.userId === userPresence.userId);

		if (existingUserIndex >= 0) {
			currentUsers[existingUserIndex] = userPresence;
		} else {
			currentUsers.push(userPresence);
		}

		// Remove offline users
		const onlineUsers = currentUsers.filter(u => u.isOnline);
		this.onlineUsers.next(onlineUsers);
	}

	private showBrowserNotification(notification: Notification): void {
		if ('Notification' in window && Notification.permission === 'granted') {
			new Notification(notification.title, {
				body: notification.message,
				icon: '/assets/icons/hospital-icon.png',
				badge: '/assets/icons/notification-badge.png',
				tag: notification.id,
				requireInteraction: notification.priority === 'critical'
			});
		}
	}

	public async requestNotificationPermission(): Promise<string> {
		if ('Notification' in window) {
			const permission = await Notification.requestPermission();
			return permission;
		}
		return 'denied';
	}

	// Connection status
	public isConnected(): boolean {
		return this.hubConnection?.state === 'Connected';
	}

	public getConnectionState(): string {
		return this.hubConnection?.state || 'Disconnected';
	}
}
