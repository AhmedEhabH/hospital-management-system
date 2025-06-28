import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SignalrService } from '../../../core/services/signalr.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MedicalAlert, NotificationData } from '../../../core/models/dtos';

@Component({
	selector: 'app-real-time-alerts',
	standalone: false,
	templateUrl: './real-time-alerts.component.html',
	styleUrl: './real-time-alerts.component.scss'
})

export class RealTimeAlertsComponent implements OnInit, OnDestroy {
	medicalAlerts: MedicalAlert[] = [];
	notifications: NotificationData[] = [];
	connectionState = 'Disconnected';
	showAlertsPanel = false;
	unreadAlertsCount = 0;

	private subscriptions: Subscription[] = [];

	constructor(
		private SignalrService: SignalrService,
		private router: Router,
		private snackBar: MatSnackBar
	) { }

	ngOnInit(): void {
		// Request notification permission
		this.SignalrService.requestNotificationPermission();

		// Subscribe to connection state
		this.subscriptions.push(
			this.SignalrService.connectionState$.subscribe(state => {
				this.connectionState = state;
				if (state === 'Connected') {
					this.showConnectionStatus('Connected to real-time alerts', 'success');
				} else if (state === 'Failed') {
					this.showConnectionStatus('Failed to connect to alerts', 'error');
				}
			})
		);

		// Subscribe to medical alerts
		this.subscriptions.push(
			this.SignalrService.medicalAlerts$.subscribe(alerts => {
				this.medicalAlerts = alerts;
				this.updateUnreadCount();

				// Show snackbar for new critical alerts
				const newCriticalAlerts = alerts.filter(a =>
					!a.acknowledged && (a.alertType === 'critical' || a.alertType === 'emergency')
				);

				if (newCriticalAlerts.length > 0) {
					this.showCriticalAlertSnackbar(newCriticalAlerts[0]);
				}
			})
		);

		// Subscribe to general notifications
		this.subscriptions.push(
			this.SignalrService.notifications$.subscribe(notifications => {
				this.notifications = notifications;
			})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}

	private updateUnreadCount(): void {
		this.unreadAlertsCount = this.medicalAlerts.filter(alert => !alert.acknowledged).length;
	}

	private showConnectionStatus(message: string, type: 'success' | 'error'): void {
		this.snackBar.open(message, 'Close', {
			duration: 3000,
			panelClass: [`snackbar-${type}`]
		});
	}

	private showCriticalAlertSnackbar(alert: MedicalAlert): void {
		const snackBarRef = this.snackBar.open(
			`${alert.title}: ${alert.message}`,
			'View Details',
			{
				duration: 10000,
				panelClass: ['snackbar-critical']
			}
		);

		snackBarRef.onAction().subscribe(() => {
			this.viewAlertDetails(alert);
		});
	}

	public toggleAlertsPanel(): void {
		this.showAlertsPanel = !this.showAlertsPanel;
	}

	public acknowledgeAlert(alert: MedicalAlert): void {
		this.SignalrService.acknowledgeAlert(alert.id);
	}

	public clearAlert(alert: MedicalAlert): void {
		this.SignalrService.clearAlert(alert.id);
	}

	public clearAllAlerts(): void {
		this.SignalrService.clearAllAlerts();
	}

	public viewAlertDetails(alert: MedicalAlert): void {
		if (alert.actionUrl) {
			this.router.navigateByUrl(alert.actionUrl);
		} else if (alert.labReportId) {
			this.router.navigate(['/lab-reports', alert.labReportId]);
		} else {
			this.router.navigate(['/patient-dashboard']);
		}
		this.showAlertsPanel = false;
	}

	public getAlertIcon(alertType: string): string {
		switch (alertType) {
			case 'critical': return 'error';
			case 'emergency': return 'local_hospital';
			case 'warning': return 'warning';
			default: return 'info';
		}
	}

	public getAlertClass(alertType: string): string {
		switch (alertType) {
			case 'critical': return 'alert-critical';
			case 'emergency': return 'alert-emergency';
			case 'warning': return 'alert-warning';
			default: return 'alert-info';
		}
	}

	public formatTimestamp(timestamp: Date): string {
		const now = new Date();
		const diff = now.getTime() - new Date(timestamp).getTime();
		const minutes = Math.floor(diff / 60000);

		if (minutes < 1) return 'Just now';
		if (minutes < 60) return `${minutes}m ago`;
		if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
		return new Date(timestamp).toLocaleDateString();
	}

	public get isConnected(): boolean {
		return this.connectionState === 'Connected';
	}

	public get criticalAlertsCount(): number {
		return this.medicalAlerts.filter(a =>
			!a.acknowledged && (a.alertType === 'critical' || a.alertType === 'emergency')
		).length;
	}
}