import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil, interval } from 'rxjs';
import { LabReportService, LabReport } from '../../../core/services/lab-report.service';
import { ThemeService } from '../../../core/services/theme.service';
import { MatSnackBar } from '@angular/material/snack-bar';

interface CriticalAlert {
	id: string;
	reportId: number;
	testName: string;
	value: number;
	unit: string;
	referenceRange: string;
	severity: 'Critical' | 'High' | 'Low';
	timestamp: Date;
	acknowledged: boolean;
	doctorNotified: boolean;
	patientName: string;
	notes?: string;
}

@Component({
	selector: 'app-critical-alerts',
	templateUrl: './critical-alerts.component.html',
	styleUrls: ['./critical-alerts.component.scss']
})
export class CriticalAlertsComponent implements OnInit, OnDestroy {
	@Input() patientId?: number;

	private destroy$ = new Subject<void>();
	private alertPolling$ = interval(30000); // Poll every 30 seconds

	isDarkMode = false;
	isLoading = true;

	// Critical Alerts Data
	criticalAlerts: CriticalAlert[] = [];
	filteredAlerts: CriticalAlert[] = [];

	// Filter Options
	selectedSeverity = 'All';
	selectedStatus = 'All';
	showAcknowledged = false;

	severityOptions = ['All', 'Critical', 'High', 'Low'];
	statusOptions = ['All', 'New', 'Acknowledged', 'Doctor Notified'];

	// Statistics
	alertStats = {
		totalAlerts: 0,
		newAlerts: 0,
		criticalAlerts: 0,
		acknowledgedAlerts: 0
	};

	constructor(
		private labReportService: LabReportService,
		private themeService: ThemeService,
		private snackBar: MatSnackBar
	) { }

	ngOnInit(): void {
		this.subscribeToTheme();
		this.loadCriticalAlerts();
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

	private loadCriticalAlerts(): void {
		this.isLoading = true;

		this.labReportService.getCriticalAlerts(this.patientId)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (reports: LabReport[]) => {
					this.processCriticalAlerts(reports);
					this.calculateStatistics();
					this.applyFilters();
					this.isLoading = false;
				},
				error: (error: any) => {
					console.error('Error loading critical alerts:', error);
					this.loadMockAlerts();
					this.isLoading = false;
				}
			});
	}

	private processCriticalAlerts(reports: LabReport[]): void {
		this.criticalAlerts = [];

		reports.forEach(report => {
			if (report.results) {
				report.results.forEach(result => {
					if (result.flagged || result.status === 'Critical' || result.status === 'High' || result.status === 'Low') {
						this.criticalAlerts.push({
							id: `${report.id}-${result.testName}`,
							reportId: report.id,
							testName: result.testName,
							value: result.value,
							unit: result.unit,
							referenceRange: result.referenceRange,
							severity: result.status as 'Critical' | 'High' | 'Low',
							timestamp: report.reportDate,
							acknowledged: false,
							doctorNotified: report.status === 'Reviewed',
							patientName: report.patientName,
							notes: report.notes
						});
					}
				});
			}
		});

		// Sort by severity and timestamp
		this.criticalAlerts.sort((a, b) => {
			const severityOrder = { 'Critical': 3, 'High': 2, 'Low': 1 };
			const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
			if (severityDiff !== 0) return severityDiff;
			return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
		});
	}

	private loadMockAlerts(): void {
		this.criticalAlerts = [
			{
				id: 'alert-1',
				reportId: 3,
				testName: 'Glucose',
				value: 185,
				unit: 'mg/dL',
				referenceRange: '70-99',
				severity: 'Critical',
				timestamp: new Date('2024-12-05T14:30:00'),
				acknowledged: false,
				doctorNotified: true,
				patientName: 'John Doe',
				notes: 'Patient requires immediate follow-up for diabetes management'
			},
			{
				id: 'alert-2',
				reportId: 2,
				testName: 'Total Cholesterol',
				value: 245,
				unit: 'mg/dL',
				referenceRange: '<200',
				severity: 'High',
				timestamp: new Date('2024-12-10T10:15:00'),
				acknowledged: true,
				doctorNotified: true,
				patientName: 'John Doe',
				notes: 'Dietary counseling recommended'
			},
			{
				id: 'alert-3',
				reportId: 1,
				testName: 'Hemoglobin',
				value: 10.5,
				unit: 'g/dL',
				referenceRange: '12.0-15.5',
				severity: 'Low',
				timestamp: new Date('2024-12-15T09:45:00'),
				acknowledged: false,
				doctorNotified: false,
				patientName: 'John Doe'
			}
		];
	}

	private calculateStatistics(): void {
		this.alertStats = {
			totalAlerts: this.criticalAlerts.length,
			newAlerts: this.criticalAlerts.filter(alert => !alert.acknowledged).length,
			criticalAlerts: this.criticalAlerts.filter(alert => alert.severity === 'Critical').length,
			acknowledgedAlerts: this.criticalAlerts.filter(alert => alert.acknowledged).length
		};
	}

	private startRealTimeUpdates(): void {
		this.alertPolling$
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				this.loadCriticalAlerts();
			});
	}

	// Filter Methods
	applyFilters(): void {
		let filtered = [...this.criticalAlerts];

		// Severity filter
		if (this.selectedSeverity !== 'All') {
			filtered = filtered.filter(alert => alert.severity === this.selectedSeverity);
		}

		// Status filter
		if (this.selectedStatus !== 'All') {
			switch (this.selectedStatus) {
				case 'New':
					filtered = filtered.filter(alert => !alert.acknowledged);
					break;
				case 'Acknowledged':
					filtered = filtered.filter(alert => alert.acknowledged);
					break;
				case 'Doctor Notified':
					filtered = filtered.filter(alert => alert.doctorNotified);
					break;
			}
		}

		// Show/hide acknowledged alerts
		if (!this.showAcknowledged) {
			filtered = filtered.filter(alert => !alert.acknowledged);
		}

		this.filteredAlerts = filtered;
	}

	// Action Methods
	acknowledgeAlert(alert: CriticalAlert): void {
		alert.acknowledged = true;
		this.calculateStatistics();
		this.applyFilters();

		this.snackBar.open('Alert acknowledged', 'Close', {
			duration: 3000,
			panelClass: ['success-snackbar']
		});
	}

	notifyDoctor(alert: CriticalAlert): void {
		alert.doctorNotified = true;
		this.calculateStatistics();

		this.snackBar.open('Doctor has been notified', 'Close', {
			duration: 3000,
			panelClass: ['success-snackbar']
		});
	}

	viewReport(alert: CriticalAlert): void {
		console.log('View report for alert:', alert);
		// Navigate to detailed report view
	}

	// Utility Methods
	getSeverityClass(severity: string): string {
		switch (severity.toLowerCase()) {
			case 'critical': return 'severity-critical';
			case 'high': return 'severity-high';
			case 'low': return 'severity-low';
			default: return 'severity-normal';
		}
	}

	getSeverityIcon(severity: string): string {
		switch (severity.toLowerCase()) {
			case 'critical': return 'error';
			case 'high': return 'warning';
			case 'low': return 'info';
			default: return 'check_circle';
		}
	}

	formatTimestamp(timestamp: Date): string {
		const now = new Date();
		const alertTime = new Date(timestamp);
		const diffInHours = Math.abs(now.getTime() - alertTime.getTime()) / 36e5;

		if (diffInHours < 1) {
			const diffInMinutes = Math.floor(diffInHours * 60);
			return `${diffInMinutes} minutes ago`;
		} else if (diffInHours < 24) {
			return `${Math.floor(diffInHours)} hours ago`;
		} else {
			return alertTime.toLocaleDateString();
		}
	}

	isUrgent(alert: CriticalAlert): boolean {
		const hoursSinceAlert = Math.abs(new Date().getTime() - new Date(alert.timestamp).getTime()) / 36e5;
		return alert.severity === 'Critical' && !alert.acknowledged && hoursSinceAlert < 2;
	}
}
