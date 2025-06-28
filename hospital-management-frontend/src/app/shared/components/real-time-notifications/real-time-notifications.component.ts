import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { SignalrService } from '../../../core/services/signalr.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppointmentReminder, CriticalAlert, SystemNotification } from '../../../core/models';

@Component({
	selector: 'app-real-time-notifications',
	standalone: false,
	templateUrl: './real-time-notifications.component.html',
	styleUrls: ['./real-time-notifications.component.scss']
})
export class RealTimeNotificationsComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	criticalAlerts: CriticalAlert[] = [];
	appointmentReminders: AppointmentReminder[] = [];
	systemNotifications: SystemNotification[] = [];
	isConnected = false;
	currentUser: any = null;

	constructor(
		private SignalrService: SignalrService,
		private authService: AuthService,
		private snackBar: MatSnackBar
	) { }

	ngOnInit(): void {
		this.currentUser = this.authService.getCurrentUser();
		this.initializeSignalR();
		this.subscribeToNotifications();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
		this.SignalrService.stopConnection();
	}

	private async initializeSignalR(): Promise<void> {
		try {
			await this.SignalrService.requestNotificationPermission();
			await this.SignalrService.startConnection();
		} catch (error) {
			console.error('Failed to initialize SignalR:', error);
			this.snackBar.open('Failed to connect to real-time notifications', 'Close', {
				duration: 5000,
				panelClass: ['error-snackbar']
			});
		}
	}

	private subscribeToNotifications(): void {
		// Connection status
		this.SignalrService.connectionStatus$
			.pipe(takeUntil(this.destroy$))
			.subscribe(isConnected => {
				this.isConnected = isConnected;
				if (isConnected) {
					this.snackBar.open('Connected to real-time notifications', 'Close', {
						duration: 3000,
						panelClass: ['success-snackbar']
					});
				}
			});

		// Critical alerts
		this.SignalrService.criticalAlerts$
			.pipe(takeUntil(this.destroy$))
			.subscribe(alerts => {
				this.criticalAlerts = alerts;
				if (alerts.length > 0) {
					const latestAlert = alerts[0];
					this.showCriticalAlertSnackbar(latestAlert);
				}
			});

		// Appointment reminders
		this.SignalrService.appointmentReminders$
			.pipe(takeUntil(this.destroy$))
			.subscribe(reminders => {
				this.appointmentReminders = reminders;
				if (reminders.length > 0) {
					const latestReminder = reminders[0];
					this.showAppointmentReminderSnackbar(latestReminder);
				}
			});

		// System notifications
		this.SignalrService.systemNotifications$
			.pipe(takeUntil(this.destroy$))
			.subscribe(notifications => {
				this.systemNotifications = notifications;
				if (notifications.length > 0) {
					const latestNotification = notifications[0];
					this.showSystemNotificationSnackbar(latestNotification);
				}
			});
	}

	private showCriticalAlertSnackbar(alert: CriticalAlert): void {
		this.snackBar.open(
			`🚨 CRITICAL: ${alert.alertMessage}`,
			'VIEW',
			{
				duration: 10000,
				panelClass: ['critical-snackbar'],
				horizontalPosition: 'right',
				verticalPosition: 'top'
			}
		);
	}

	private showAppointmentReminderSnackbar(reminder: AppointmentReminder): void {
		this.snackBar.open(
			`📅 Appointment Reminder: ${reminder.reminderMessage}`,
			'OK',
			{
				duration: 5000,
				panelClass: ['info-snackbar']
			}
		);
	}

	private showSystemNotificationSnackbar(notification: SystemNotification): void {
		this.snackBar.open(
			`📢 ${notification.title}: ${notification.message}`,
			'OK',
			{
				duration: 5000,
				panelClass: ['info-snackbar']
			}
		);
	}

	public clearCriticalAlerts(): void {
		this.SignalrService.clearCriticalAlerts();
	}

	public clearAppointmentReminders(): void {
		this.SignalrService.clearAppointmentReminders();
	}

	public clearSystemNotifications(): void {
		this.SignalrService.clearSystemNotifications();
	}

	public getConnectionStatusIcon(): string {
		return this.isConnected ? 'wifi' : 'wifi_off';
	}

	public getConnectionStatusText(): string {
		return this.isConnected ? 'Connected' : 'Disconnected';
	}
}
