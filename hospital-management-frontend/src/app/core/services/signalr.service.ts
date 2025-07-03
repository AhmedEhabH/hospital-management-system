import { Injectable } from '@angular/core';
import { HttpTransportType, HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { AppointmentReminder, ChatMessage, CriticalAlert, MedicalAlert, NotificationData, OnlineUser, SystemNotification, TypingIndicator, UserPresence } from '../models/dtos';

@Injectable({
	providedIn: 'root'
})
export class SignalrService {

	private hubConnection: HubConnection | null = null;
	private isConnect = false;
	private connectionState = new BehaviorSubject<string>('Disconnected');
	private medicalAlerts = new BehaviorSubject<MedicalAlert[]>([]);
	private notifications = new BehaviorSubject<NotificationData[]>([]);
	private messageReceived = new BehaviorSubject<ChatMessage | null>(null);
	private typingIndicator = new BehaviorSubject<TypingIndicator | null>(null);
	private onlineUsers = new BehaviorSubject<UserPresence[]>([]);
	private notificationReceived = new BehaviorSubject<NotificationData | null>(null);
	private criticalAlert = new BehaviorSubject<MedicalAlert | null>(null);

	// Observable streams
	public connectionState$ = this.connectionState.asObservable();
	public medicalAlerts$ = this.medicalAlerts.asObservable();
	public notifications$ = this.notifications.asObservable();
	public messageReceived$ = this.messageReceived.asObservable();
	public typingIndicator$ = this.typingIndicator.asObservable();
	// public onlineUsers$ = this.onlineUsers.asObservable();
	public notificationReceived$ = this.notificationReceived.asObservable();
	public criticalAlert$ = this.criticalAlert.asObservable();

	private criticalAlertsSubject = new BehaviorSubject<CriticalAlert[]>([]);
	private appointmentRemindersSubject = new BehaviorSubject<AppointmentReminder[]>([]);
	private systemNotificationsSubject = new BehaviorSubject<SystemNotification[]>([]);
	private onlineUsersSubject = new BehaviorSubject<OnlineUser[]>([]);
	private connectionStatusSubject = new BehaviorSubject<boolean>(false);

	public criticalAlerts$ = this.criticalAlertsSubject.asObservable();
	public appointmentReminders$ = this.appointmentRemindersSubject.asObservable();
	public systemNotifications$ = this.systemNotificationsSubject.asObservable();
	public onlineUsers$ = this.onlineUsersSubject.asObservable();
	public connectionStatus$ = this.connectionStatusSubject.asObservable();


	constructor(
		private authService: AuthService
	) {
		// Auto-connect when user is authenticated
		this.authService.isAuthenticated$.subscribe(isAuth => {
			if (isAuth) {
				this.startConnection();
			} else {
				this.stopConnection();
			}
		});
	}


	/* public async startConnection(): Promise<void> {
		if (this.hubConnection?.state === 'Connected') {
			return;
		}

		const token = this.authService.getToken();
		if (!token) {
			console.warn('No authentication token available for SignalR connection');
			return;
		}

		this.hubConnection = new HubConnectionBuilder()
			.withUrl(`${environment.signalRUrl}`, {
				accessTokenFactory: () => token
			})
			.withAutomaticReconnect([0, 2000, 10000, 30000])
			.configureLogging(LogLevel.Information)
			.build();

		try {
			await this.hubConnection.start();
			this.connectionState.next('Connected');
			console.log('SignalR Connected successfully');

			await this.joinUserGroup();
			this.setupEventHandlers();

		} catch (error) {
			console.error('SignalR Connection failed:', error);
			this.connectionState.next('Failed');
		}
	} */

	/* public async stopConnection(): Promise<void> {
		if (this.hubConnection) {
			await this.hubConnection.stop();
			this.connectionState.next('Disconnected');
			console.log('SignalR Disconnected');
		}
	} */

	private mapOnlineUserToUserPresence(onlineUser: OnlineUser): UserPresence {
		return {
			userId: onlineUser.userId,
			userName: onlineUser.userType, // You might want to fetch actual username
			isOnline: true,
			status: 'online',
			lastSeen: onlineUser.lastSeen,
			userType: onlineUser.userType,
			connectionCount: onlineUser.connectionCount
		};
	}

	// Create a mapped observable
	public get userPresences$(): Observable<UserPresence[]> {
		return this.onlineUsers$.pipe(
			map(users => users.map(user => this.mapOnlineUserToUserPresence(user)))
		);
	}

	private async joinUserGroup(): Promise<void> {
		const currentUser = this.authService.getCurrentUser();
		if (currentUser && this.hubConnection) {
			try {
				await this.hubConnection.invoke('JoinUserGroup', currentUser.id.toString());

				// Join role-specific groups
				if (currentUser.userType === 'Doctor') {
					await this.hubConnection.invoke('JoinGroup', 'Doctors');
				} else if (currentUser.userType === 'Patient') {
					await this.hubConnection.invoke('JoinGroup', 'Patients');
				} else if (currentUser.userType === 'Admin') {
					await this.hubConnection.invoke('JoinGroup', 'Admins');
				}

				console.log(`Joined SignalR groups for user: ${currentUser.userType}`);
			} catch (error) {
				console.error('Failed to join SignalR groups:', error);
			}
		}
	}

	private setupEventHandlers(): void {
		if (!this.hubConnection) return;

		// Critical Lab Alert Handler
		this.hubConnection.on('CriticalAlert', (data: NotificationData) => {
			console.log('Critical Alert received:', data);
			this.handleCriticalAlert(data);
		});

		// General Notification Handler
		this.hubConnection.on('ReceiveNotification', (data: NotificationData) => {
			console.log('Notification received:', data);
			this.handleNotification(data);
		});

		// Emergency Alert Handler
		this.hubConnection.on('EmergencyAlert', (data: NotificationData) => {
			console.log('Emergency Alert received:', data);
			this.handleEmergencyAlert(data);
		});

		// Medical Alert Handler
		this.hubConnection.on('MedicalAlert', (alert: MedicalAlert) => {
			console.log('Medical Alert received:', alert);
			this.handleMedicalAlert(alert);
		});

		// FIXED: Add missing message handlers
		this.hubConnection.on('MessageReceived', (message: ChatMessage) => {
			console.log('Message received:', message);
			this.messageReceived.next(message);
		});

		this.hubConnection.on('TypingIndicator', (indicator: TypingIndicator) => {
			console.log('Typing indicator received:', indicator);
			this.typingIndicator.next(indicator);
		});

		this.hubConnection.on('OnlineUsersUpdate', (users: UserPresence[]) => {
			console.log('Online users updated:', users);
			this.onlineUsers.next(users);
		});

		this.hubConnection.on('NotificationReceived', (notification: NotificationData) => {
			console.log('Notification received:', notification);
			this.notificationReceived.next(notification);
		});

		// Connection state handlers
		this.hubConnection.onreconnecting(() => {
			this.connectionState.next('Reconnecting');
			console.log('SignalR Reconnecting...');
		});

		this.hubConnection.onreconnected(() => {
			this.connectionState.next('Connected');
			console.log('SignalR Reconnected');
			this.joinUserGroup();
		});

		this.hubConnection.onclose(() => {
			this.connectionState.next('Disconnected');
			console.log('SignalR Connection closed');
		});
	}

	private handleCriticalAlert(data: NotificationData): void {
		// Create medical alert from critical notification
		const alert: MedicalAlert = {
			id: `critical_${Date.now()}`,
			patientId: data.data?.PatientId || 0,
			patientName: data.data?.PatientName || 'Unknown Patient',
			alertType: 'critical',
			title: data.title,
			message: data.message,
			timestamp: new Date(data.timestamp),
			labReportId: data.data?.LabReportId,
			priority: 'high',
			actionUrl: data.actionUrl,
			acknowledged: false,
			doctorNotified: false
		};

		this.addMedicalAlert(alert);
		this.addNotification(data);
		this.criticalAlert.next(alert);
		// this.showBrowserNotification(data);
		this.playAlertSound();
	}

	private handleEmergencyAlert(data: NotificationData): void {
		const alert: MedicalAlert = {
			id: `emergency_${Date.now()}`,
			patientId: data.data?.PatientId || 0,
			patientName: data.data?.PatientName || 'Unknown Patient',
			alertType: 'emergency',
			title: data.title,
			message: data.message,
			timestamp: new Date(data.timestamp),
			priority: 'high',
			acknowledged: false,
			doctorNotified: true
		};

		this.addMedicalAlert(alert);
		this.addNotification(data);
		// this.showBrowserNotification(data);
		this.playEmergencySound();
	}

	private handleNotification(data: NotificationData): void {
		this.addNotification(data);
		this.notificationReceived.next(data);

		if (data.priority === 'critical' || data.priority === 'high') {
			// this.showBrowserNotification(data);
		}
	}

	private handleMedicalAlert(alert: MedicalAlert): void {
		this.addMedicalAlert(alert);

		const notificationData: NotificationData = {
			title: alert.title,
			message: alert.message,
			type: 'medical',
			priority: alert.priority as any,
			timestamp: alert.timestamp,
			actionUrl: alert.actionUrl
		};

		this.addNotification(notificationData);
		// this.showBrowserNotification(notificationData);
	}

	private addMedicalAlert(alert: MedicalAlert): void {
		const currentAlerts = this.medicalAlerts.value;
		const updatedAlerts = [alert, ...currentAlerts].slice(0, 50); // Keep last 50 alerts
		this.medicalAlerts.next(updatedAlerts);
	}

	private addNotification(notification: NotificationData): void {
		const currentNotifications = this.notifications.value;
		const updatedNotifications = [notification, ...currentNotifications].slice(0, 100);
		this.notifications.next(updatedNotifications);
	}

	/* private showBrowserNotification(data: NotificationData): void {
		if ('Notification' in window && Notification.permission === 'granted') {
			const notification = new Notification(data.title, {
				body: data.message,
				icon: '/assets/icons/medical-alert.png',
				badge: '/assets/icons/hospital-badge.png',
				tag: `medical-${Date.now()}`,
				requireInteraction: data.priority === 'critical'
			});

			notification.onclick = () => {
				window.focus();
				if (data.actionUrl) {
					window.location.href = data.actionUrl;
				}
				notification.close();
			};

			// Auto-close non-critical notifications
			if (data.priority !== 'critical') {
				setTimeout(() => notification.close(), 5000);
			}
		}
	} */

	private playAlertSound(): void {
		const audio = new Audio('/assets/sounds/medical-alert.mp3');
		audio.volume = 0.7;
		audio.play().catch(e => console.log('Could not play alert sound:', e));
	}

	private playEmergencySound(): void {
		const audio = new Audio('/assets/sounds/emergency-alert.mp3');
		audio.volume = 0.9;
		audio.play().catch(e => console.log('Could not play emergency sound:', e));
	}

	// FIXED: Add missing public methods
	public async sendMessage(message: ChatMessage): Promise<void> {
		if (this.hubConnection?.state === 'Connected') {
			try {
				await this.hubConnection.invoke('SendMessage', message);
			} catch (error) {
				console.error('Failed to send message:', error);
			}
		}
	}

	public async sendTypingIndicator(userId: number, isTyping: boolean, conversationId: string): Promise<void> {
		if (this.hubConnection?.state === 'Connected') {
			try {
				await this.hubConnection.invoke('SendTypingIndicator', userId, isTyping, conversationId);
			} catch (error) {
				console.error('Failed to send typing indicator:', error);
			}
		}
	}

	public async markMessageAsRead(messageId: string): Promise<void> {
		if (this.hubConnection?.state === 'Connected') {
			try {
				await this.hubConnection.invoke('MarkMessageAsRead', messageId);
			} catch (error) {
				console.error('Failed to mark message as read:', error);
			}
		}
	}

	// Existing methods for sending alerts
	public async sendCriticalLabAlert(patientId: number, labReportId: number, alertMessage: string): Promise<void> {
		if (this.hubConnection?.state === 'Connected') {
			try {
				await this.hubConnection.invoke('SendCriticalLabAlert', patientId, labReportId, alertMessage);
			} catch (error) {
				console.error('Failed to send critical lab alert:', error);
			}
		}
	}

	/* public async sendAppointmentReminder(patientId: number, appointmentDate: Date, doctorName: string): Promise<void> {
		if (this.hubConnection?.state === 'Connected') {
			try {
				await this.hubConnection.invoke('SendAppointmentReminder', patientId, appointmentDate, doctorName);
			} catch (error) {
				console.error('Failed to send appointment reminder:', error);
			}
		}
	} */

	public async notifyDoctorsOfEmergency(patientId: number, emergencyDetails: string): Promise<void> {
		if (this.hubConnection?.state === 'Connected') {
			try {
				await this.hubConnection.invoke('NotifyDoctorsOfEmergency', patientId, emergencyDetails);
			} catch (error) {
				console.error('Failed to notify doctors of emergency:', error);
			}
		}
	}

	// Alert management methods
	public acknowledgeAlert(alertId: string): void {
		const currentAlerts = this.medicalAlerts.value;
		const updatedAlerts = currentAlerts.map(alert =>
			alert.id === alertId ? { ...alert, acknowledged: true } : alert
		);
		this.medicalAlerts.next(updatedAlerts);
	}

	public clearAlert(alertId: string): void {
		const currentAlerts = this.medicalAlerts.value;
		const updatedAlerts = currentAlerts.filter(alert => alert.id !== alertId);
		this.medicalAlerts.next(updatedAlerts);
	}

	public clearAllAlerts(): void {
		this.medicalAlerts.next([]);
	}

	/* public requestNotificationPermission(): void {
		if ('Notification' in window && Notification.permission === 'default') {
			Notification.requestPermission().then(permission => {
				console.log('Notification permission:', permission);
			});
		}
	} */

	// Get connection status
	public isConnected(): boolean {
		return this.hubConnection?.state === 'Connected';
	}

	public getConnectionState(): string {
		return this.connectionState.value;
	}

	public async startConnection(): Promise<void> {
		if (this.isConnect) {
			console.log('SignalR connection already established');
			return;
		}

		const currentUser = this.authService.getCurrentUser();
		const token = this.authService.getToken();
		if (!currentUser) {
			console.error('No authenticated user found');
			return;
		}

		try {
			this.hubConnection = new HubConnectionBuilder()
				.withUrl(`${environment.apiUrl}/hubs/medical-alerts`, {
					accessTokenFactory: () => token || '',
					skipNegotiation: true,
					transport: HttpTransportType.WebSockets
				})
				.withAutomaticReconnect([0, 2000, 10000, 30000])
				.configureLogging(LogLevel.Information)
				.build();

			// Set up event listeners
			this.setupEventListeners();

			// Start connection
			await this.hubConnection.start();
			this.isConnect = true;
			this.connectionStatusSubject.next(true);

			// Join user group
			await this.hubConnection.invoke('JoinUserGroup',
				currentUser.id.toString(),
				currentUser.userType
			);

			console.log('✅ SignalR connection established successfully');

			// Get initial online users if admin
			if (currentUser.userType === 'Admin') {
				await this.refreshOnlineUsers();
			}

		} catch (error) {
			console.error('❌ Error starting SignalR connection:', error);
			this.connectionStatusSubject.next(false);
		}
	}

	private setupEventListeners(): void {
		if (!this.hubConnection) return;

		// Critical medical alerts
		this.hubConnection.on('CriticalMedicalAlert', (alert: CriticalAlert) => {
			console.log('🚨 Critical medical alert received:', alert);
			const currentAlerts = this.criticalAlertsSubject.value;
			this.criticalAlertsSubject.next([alert, ...currentAlerts]);

			// Show browser notification for critical alerts
			this.showBrowserNotification(
				'🚨 Critical Medical Alert',
				`${alert.alertMessage} - Patient: ${alert.patientName}`,
				'critical'
			);
		});

		// Personal medical alerts for patients
		this.hubConnection.on('PersonalMedicalAlert', (alert: CriticalAlert) => {
			console.log('⚠️ Personal medical alert received:', alert);
			this.showBrowserNotification(
				'⚠️ Medical Alert',
				alert.alertMessage,
				'warning'
			);
		});

		// Appointment reminders
		this.hubConnection.on('AppointmentReminder', (reminder: AppointmentReminder) => {
			console.log('📅 Appointment reminder received:', reminder);
			const currentReminders = this.appointmentRemindersSubject.value;
			this.appointmentRemindersSubject.next([reminder, ...currentReminders]);

			this.showBrowserNotification(
				'📅 Appointment Reminder',
				reminder.reminderMessage,
				'info'
			);
		});

		// System notifications
		this.hubConnection.on('SystemNotification', (notification: SystemNotification) => {
			console.log('📢 System notification received:', notification);
			const currentNotifications = this.systemNotificationsSubject.value;
			this.systemNotificationsSubject.next([notification, ...currentNotifications]);
		});

		// Online user tracking (for admins)
		this.hubConnection.on('UserConnected', (user: any) => {
			console.log('👤 User connected:', user);
			this.refreshOnlineUsers();
		});

		this.hubConnection.on('UserDisconnected', (user: any) => {
			console.log('👤 User disconnected:', user);
			this.refreshOnlineUsers();
		});

		// Connection state management
		this.hubConnection.onreconnecting(() => {
			console.log('🔄 SignalR reconnecting...');
			this.connectionStatusSubject.next(false);
		});

		this.hubConnection.onreconnected(() => {
			console.log('✅ SignalR reconnected successfully');
			this.connectionStatusSubject.next(true);
		});

		this.hubConnection.onclose(() => {
			console.log('❌ SignalR connection closed');
			this.isConnect = false;
			this.connectionStatusSubject.next(false);
		});
	}

	public async sendCriticalAlert(alert: Omit<CriticalAlert, 'createdAt'>): Promise<void> {
		if (!this.hubConnection || !this.isConnected) {
			throw new Error('SignalR connection not established');
		}

		try {
			await this.hubConnection.invoke('SendCriticalAlert', {
				...alert,
				createdAt: new Date().toISOString()
			});
			console.log('✅ Critical alert sent successfully');
		} catch (error) {
			console.error('❌ Error sending critical alert:', error);
			throw error;
		}
	}

	public async sendAppointmentReminder(reminder: AppointmentReminder): Promise<void> {
		if (!this.hubConnection || !this.isConnected) {
			throw new Error('SignalR connection not established');
		}

		try {
			await this.hubConnection.invoke('SendAppointmentReminder', reminder);
			console.log('✅ Appointment reminder sent successfully');
		} catch (error) {
			console.error('❌ Error sending appointment reminder:', error);
			throw error;
		}
	}

	public async sendSystemNotification(notification: Omit<SystemNotification, 'createdAt'>): Promise<void> {
		if (!this.hubConnection || !this.isConnected) {
			throw new Error('SignalR connection not established');
		}

		try {
			await this.hubConnection.invoke('SendSystemNotification', {
				...notification,
				createdAt: new Date().toISOString()
			});
			console.log('✅ System notification sent successfully');
		} catch (error) {
			console.error('❌ Error sending system notification:', error);
			throw error;
		}
	}

	public async refreshOnlineUsers(): Promise<void> {
		if (!this.hubConnection || !this.isConnected) return;

		try {
			const onlineUsers = await this.hubConnection.invoke('GetOnlineUsers');
			this.onlineUsersSubject.next(onlineUsers);
			console.log('👥 Online users refreshed:', onlineUsers);
		} catch (error) {
			console.error('❌ Error refreshing online users:', error);
		}
	}

	private showBrowserNotification(title: string, body: string, type: 'critical' | 'warning' | 'info'): void {
		if ('Notification' in window && Notification.permission === 'granted') {
			const notification = new Notification(title, {
				body,
				icon: '/assets/icons/medical-alert.png',
				badge: '/assets/icons/hospital-badge.png',
				tag: `medical-alert-${Date.now()}`,
				requireInteraction: type === 'critical'
			});

			// Auto-close non-critical notifications
			if (type !== 'critical') {
				setTimeout(() => notification.close(), 5000);
			}
		}
	}

	public async requestNotificationPermission(): Promise<void> {
		if ('Notification' in window && Notification.permission === 'default') {
			const permission = await Notification.requestPermission();
			console.log('Notification permission:', permission);
		}
	}

	public async stopConnection(): Promise<void> {
		if (this.hubConnection && this.isConnect) {
			try {
				await this.hubConnection.stop();
				this.isConnect = false;
				this.connectionStatusSubject.next(false);
				console.log('✅ SignalR connection stopped');
			} catch (error) {
				console.error('❌ Error stopping SignalR connection:', error);
			}
		}
	}

	// Clear notifications
	public clearCriticalAlerts(): void {
		this.criticalAlertsSubject.next([]);
	}

	public clearAppointmentReminders(): void {
		this.appointmentRemindersSubject.next([]);
	}

	public clearSystemNotifications(): void {
		this.systemNotificationsSubject.next([]);
	}
}