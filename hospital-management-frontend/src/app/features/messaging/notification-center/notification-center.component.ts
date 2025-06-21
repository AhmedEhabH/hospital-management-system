import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs'; // FIXED: Add missing import
import { SignalRService } from '../../../core/services/signalr.service'; // FIXED: Add missing imports
import { MedicalAlert, NotificationData } from '../../../core/models/dtos';

interface NotificationCategory {
	id: string;
	name: string;
	icon: string;
	color: string;
	count: number;
}

@Component({
	selector: 'app-notification-center',
	standalone: false,
	templateUrl: './notification-center.component.html',
	styleUrls: ['./notification-center.component.scss']
})


export class NotificationCenterComponent implements OnInit, OnDestroy {
	notifications: NotificationData[] = [];
	criticalAlerts: MedicalAlert[] = []; // FIXED: Now properly typed
	loading = false;

	private subscriptions: Subscription[] = []; // FIXED: Now properly typed

	constructor(private signalRService: SignalRService) { }

	ngOnInit(): void {
		this.subscribeToNotifications();
		this.subscribeToCriticalAlerts();
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}

	private subscribeToNotifications(): void {
		// FIXED: Add proper type annotations
		this.subscriptions.push(
			this.signalRService.notificationReceived$
				.subscribe((notification: NotificationData | null) => {
					if (notification) {
						this.notifications.unshift(notification);
					}
				})
		);
	}

	private subscribeToCriticalAlerts(): void {
		this.subscriptions.push(
			this.signalRService.criticalAlert$
				.subscribe((alert: MedicalAlert | null) => { // FIXED: Now properly typed
					if (alert) {
						this.criticalAlerts.unshift(alert);
					}
				})
		);
	}

	public markNotificationAsRead(notificationId: string): void {
		// TODO: Implement mark as read functionality
		console.log('Marking notification as read:', notificationId);
	}

	public clearAllNotifications(): void {
		this.notifications = [];
	}
}