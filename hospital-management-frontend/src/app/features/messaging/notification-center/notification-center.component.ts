import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil, interval } from 'rxjs';
import { SignalRService, Notification } from '../../../core/services/signalr.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

interface NotificationCategory {
	id: string;
	name: string;
	icon: string;
	color: string;
	count: number;
}

@Component({
	selector: 'app-notification-center',
	standalone:false,
	templateUrl: './notification-center.component.html',
	styleUrls: ['./notification-center.component.scss']
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	private notificationPolling$ = interval(30000); // Poll every 30 seconds

	isDarkMode = false;
	isLoading = true;
	currentUser: any;

	// Notifications Data
	notifications: Notification[] = [];
	filteredNotifications: Notification[] = [];

	// Filter Options
	selectedCategory = 'all';
	selectedPriority = 'all';
	showReadNotifications = true;

	// Categories
	categories: NotificationCategory[] = [
		{ id: 'all', name: 'All Notifications', icon: 'notifications', color: '#4299ed', count: 0 },
		{ id: 'medical', name: 'Medical Alerts', icon: 'medical_services', color: '#f44336', count: 0 },
		{ id: 'appointment', name: 'Appointments', icon: 'event', color: '#4caf50', count: 0 },
		{ id: 'lab_result', name: 'Lab Results', icon: 'science', color: '#9c27b0', count: 0 },
		{ id: 'info', name: 'Information', icon: 'info', color: '#2196f3', count: 0 },
		{ id: 'warning', name: 'Warnings', icon: 'warning', color: '#ff9800', count: 0 },
		{ id: 'error', name: 'Errors', icon: 'error', color: '#f44336', count: 0 }
	];

	// Priority Options
	priorityOptions = [
		{ value: 'all', label: 'All Priorities', icon: 'list' },
		{ value: 'critical', label: 'Critical', icon: 'priority_high', color: '#f44336' },
		{ value: 'high', label: 'High', icon: 'flag', color: '#ff9800' },
		{ value: 'medium', label: 'Medium', icon: 'flag_outlined', color: '#4caf50' },
		{ value: 'low', label: 'Low', icon: 'low_priority', color: '#9e9e9e' }
	];

	// Statistics
	notificationStats = {
		total: 0,
		unread: 0,
		critical: 0,
		today: 0
	};

	constructor(
		private signalRService: SignalRService,
		private themeService: ThemeService,
		private authService: AuthService,
		private snackBar: MatSnackBar
	) { }

	ngOnInit(): void {
		this.currentUser = this.authService.getCurrentUser();
		this.subscribeToTheme();
		this.subscribeToNotifications();
		this.loadNotifications();
		this.startRealTimeUpdates();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private subscribeToTheme(): void {
		this.themeService.isDarkMode$
			.pipe(takeUntil(this.destroy$))
			.subscribe(isDark => {
				this.isDarkMode = isDark;
			});
	}

	private subscribeToNotifications(): void {
		// Subscribe to real-time notifications
		this.signalRService.notificationReceived$
			.pipe(takeUntil(this.destroy$))
			.subscribe(notification => {
				this.addNotification(notification);
			});

		// Subscribe to critical alerts
		this.signalRService.criticalAlert$
			.pipe(takeUntil(this.destroy$))
			.subscribe(alert => {
				this.handleCriticalAlert(alert);
			});
	}

	private loadNotifications(): void {
		this.isLoading = true;

		// Load mock notifications for development
		setTimeout(() => {
			this.notifications = this.getMockNotifications();
			this.calculateStatistics();
			this.updateCategoryCounts();
			this.applyFilters();
			this.isLoading = false;
		}, 1000);
	}

	private startRealTimeUpdates(): void {
		this.notificationPolling$
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				// In real implementation, this would fetch new notifications from the server
				console.log('Polling for new notifications...');
			});
	}

	// Notification Management
	private addNotification(notification: Notification): void {
		this.notifications.unshift(notification);
		this.calculateStatistics();
		this.updateCategoryCounts();
		this.applyFilters();

		// Show toast for new notification
		this.showNotificationToast(notification);
	}

	private handleCriticalAlert(alert: Notification): void {
		this.addNotification(alert);

		// Play sound for critical alerts
		this.playCriticalAlertSound();

		// Show persistent notification
		this.showCriticalAlertDialog(alert);
	}

	markAsRead(notification: Notification): void {
		notification.isRead = true;
		this.calculateStatistics();
		this.updateCategoryCounts();
	}

	markAllAsRead(): void {
		this.filteredNotifications.forEach(notification => {
			notification.isRead = true;
		});
		this.calculateStatistics();
		this.updateCategoryCounts();
		this.showSuccessMessage('All notifications marked as read');
	}

	deleteNotification(notification: Notification): void {
		const index = this.notifications.findIndex(n => n.id === notification.id);
		if (index >= 0) {
			this.notifications.splice(index, 1);
			this.calculateStatistics();
			this.updateCategoryCounts();
			this.applyFilters();
			this.showSuccessMessage('Notification deleted');
		}
	}

	clearAllNotifications(): void {
		this.notifications = [];
		this.filteredNotifications = [];
		this.calculateStatistics();
		this.updateCategoryCounts();
		this.showSuccessMessage('All notifications cleared');
	}

	// Filtering
	onCategoryChange(categoryId: string): void {
		this.selectedCategory = categoryId;
		this.applyFilters();
	}

	onPriorityChange(): void {
		this.applyFilters();
	}

	onShowReadToggle(): void {
		this.applyFilters();
	}

	private applyFilters(): void {
		let filtered = [...this.notifications];

		// Category filter
		if (this.selectedCategory !== 'all') {
			filtered = filtered.filter(notification => notification.type === this.selectedCategory);
		}

		// Priority filter
		if (this.selectedPriority !== 'all') {
			filtered = filtered.filter(notification => notification.priority === this.selectedPriority);
		}

		// Read status filter
		if (!this.showReadNotifications) {
			filtered = filtered.filter(notification => !notification.isRead);
		}

		this.filteredNotifications = filtered;
	}

	// Statistics and Counts
	private calculateStatistics(): void {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		this.notificationStats = {
			total: this.notifications.length,
			unread: this.notifications.filter(n => !n.isRead).length,
			critical: this.notifications.filter(n => n.priority === 'critical').length,
			today: this.notifications.filter(n => new Date(n.timestamp) >= today).length
		};
	}

	private updateCategoryCounts(): void {
		this.categories.forEach(category => {
			if (category.id === 'all') {
				category.count = this.notifications.length;
			} else {
				category.count = this.notifications.filter(n => n.type === category.id).length;
			}
		});
	}

	// Notification Actions
	handleNotificationAction(notification: Notification): void {
		if (notification.actionUrl) {
			// Navigate to specific page
			console.log('Navigate to:', notification.actionUrl);
		}

		this.markAsRead(notification);
	}

	// Utility Methods
	getNotificationIcon(notification: Notification): string {
		switch (notification.type) {
			case 'medical': return 'medical_services';
			case 'appointment': return 'event';
			case 'lab_result': return 'science';
			case 'info': return 'info';
			case 'warning': return 'warning';
			case 'error': return 'error';
			default: return 'notifications';
		}
	}

	getNotificationColor(notification: Notification): string {
		switch (notification.priority) {
			case 'critical': return '#f44336';
			case 'high': return '#ff9800';
			case 'medium': return '#4caf50';
			case 'low': return '#9e9e9e';
			default: return '#4299ed';
		}
	}

	getPriorityIcon(priority: string): string {
		switch (priority) {
			case 'critical': return 'priority_high';
			case 'high': return 'flag';
			case 'medium': return 'flag_outlined';
			case 'low': return 'low_priority';
			default: return 'flag';
		}
	}

	formatTimestamp(timestamp: Date): string {
		const now = new Date();
		const notificationTime = new Date(timestamp);
		const diffInHours = Math.abs(now.getTime() - notificationTime.getTime()) / 36e5;

		if (diffInHours < 1) {
			const diffInMinutes = Math.floor(diffInHours * 60);
			return `${diffInMinutes} minutes ago`;
		} else if (diffInHours < 24) {
			return `${Math.floor(diffInHours)} hours ago`;
		} else {
			return notificationTime.toLocaleDateString();
		}
	}

	// Sound and Visual Effects
	private playCriticalAlertSound(): void {
		// In a real implementation, play an audio alert
		console.log('Playing critical alert sound');
	}

	private showCriticalAlertDialog(alert: Notification): void {
		// In a real implementation, show a modal dialog
		this.snackBar.open(
			`CRITICAL ALERT: ${alert.title}`,
			'ACKNOWLEDGE',
			{
				duration: 0, // Persistent
				panelClass: ['critical-alert-snackbar'],
				horizontalPosition: 'center',
				verticalPosition: 'top'
			}
		);
	}

	private showNotificationToast(notification: Notification): void {
		this.snackBar.open(
			`${notification.title}: ${notification.message}`,
			'View',
			{
				duration: 5000,
				panelClass: [`${notification.priority}-notification-snackbar`],
				horizontalPosition: 'end',
				verticalPosition: 'top'
			}
		);
	}

	private showSuccessMessage(message: string): void {
		this.snackBar.open(message, 'Close', {
			duration: 3000,
			panelClass: ['success-snackbar'],
			horizontalPosition: 'end',
			verticalPosition: 'top'
		});
	}

	// Mock Data
	private getMockNotifications(): Notification[] {
		return [
			{
				id: 'notif-1',
				userId: this.currentUser?.id || 1,
				title: 'Critical Lab Results',
				message: 'Your recent blood test shows abnormal values that require immediate attention.',
				type: 'medical',
				priority: 'critical',
				timestamp: new Date(Date.now() - 300000), // 5 minutes ago
				isRead: false,
				actionUrl: '/lab-reports',
				data: { labReportId: 123 }
			},
			{
				id: 'notif-2',
				userId: this.currentUser?.id || 1,
				title: 'Appointment Reminder',
				message: 'You have an appointment with Dr. Johnson tomorrow at 2:00 PM.',
				type: 'appointment',
				priority: 'high',
				timestamp: new Date(Date.now() - 3600000), // 1 hour ago
				isRead: false,
				actionUrl: '/appointments'
			},
			{
				id: 'notif-3',
				userId: this.currentUser?.id || 1,
				title: 'New Lab Results Available',
				message: 'Your cholesterol panel results are now available for review.',
				type: 'lab_result',
				priority: 'medium',
				timestamp: new Date(Date.now() - 7200000), // 2 hours ago
				isRead: true,
				actionUrl: '/lab-reports'
			},
			{
				id: 'notif-4',
				userId: this.currentUser?.id || 1,
				title: 'System Maintenance',
				message: 'The system will undergo maintenance tonight from 2:00 AM to 4:00 AM.',
				type: 'info',
				priority: 'low',
				timestamp: new Date(Date.now() - 86400000), // 1 day ago
				isRead: true
			},
			{
				id: 'notif-5',
				userId: this.currentUser?.id || 1,
				title: 'Medication Reminder',
				message: 'Time to take your prescribed medication.',
				type: 'warning',
				priority: 'high',
				timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
				isRead: false
			}
		];
	}
}
