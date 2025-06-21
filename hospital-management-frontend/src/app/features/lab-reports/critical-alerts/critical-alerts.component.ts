import { Component, OnInit, Input } from '@angular/core';
import { LabReportService } from '../../../core/services/lab-report.service';
import { LabReportDto } from '../../../core/models/lab-report.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
	selector: 'app-critical-alerts',
	standalone: false,
	templateUrl: './critical-alerts.component.html',
	styleUrls: ['./critical-alerts.component.scss']
})
export class CriticalAlertsComponent implements OnInit {
	@Input() patientId!: number;

	criticalReports: LabReportDto[] = [];
	filteredAlerts: LabReportDto[] = [];
	loading = false;
	isDarkMode = false;
	showAcknowledged = false;

	alertStats = {
		totalAlerts: 0,
		newAlerts: 0,
		criticalAlerts: 0,
		acknowledgedAlerts: 0
	};

	selectedSeverity = '';
	severityOptions = ['Critical', 'Warning', 'Normal'];
	selectedStatus = '';
	statusOptions = ['New', 'Acknowledged'];

	constructor(
		private labReportService: LabReportService,
		private authService: AuthService
	) { }

	ngOnInit(): void {
		if (!this.patientId) {
			const currentUser = this.authService.getCurrentUser();
			this.patientId = currentUser?.id ?? 0;
		}

		if (this.patientId) {
			this.loadCriticalAlerts();
		}

		this.isDarkMode = document.body.classList.contains('dark-theme');
	}

	private loadCriticalAlerts(): void {
		this.loading = true;
		this.labReportService.getLabReportsByPatientId(this.patientId)
			.subscribe({
				next: (reports: LabReportDto[]) => {
					this.criticalReports = reports.filter(report => this.isCritical(report));
					this.filteredAlerts = [...this.criticalReports];
					this.updateStats();
					this.loading = false;
				},
				error: (error: any) => {
					console.error('Error loading critical alerts:', error);
					this.loading = false;
				}
			});
	}

	private isCritical(report: LabReportDto): boolean {
		return (
			report.cholesterolLevel > 240 ||
			report.sucroseLevel > 200 ||
			report.whiteBloodCellsRatio > 11000 ||
			report.whiteBloodCellsRatio < 4000 ||
			report.heartBeatRatio > 100 ||
			report.heartBeatRatio < 60
		);
	}

	private updateStats(): void {
		this.alertStats = {
			totalAlerts: this.criticalReports.length,
			criticalAlerts: this.criticalReports.filter(r => this.getSeverity(r) === 'Critical').length,
			newAlerts: this.criticalReports.length,
			acknowledgedAlerts: 0
		};
	}

	public applyFilters(): void {
		this.filteredAlerts = this.criticalReports.filter(alert => {
			if (this.selectedSeverity && this.getSeverity(alert) !== this.selectedSeverity) {
				return false;
			}
			return true;
		});
	}

	public acknowledgeAll(): void {
		console.log('Acknowledging all alerts');
	}

	public getSeverityClass(alert: LabReportDto): string {
		const severity = this.getSeverity(alert);
		switch (severity) {
			case 'Critical': return 'severity-critical';
			case 'Warning': return 'severity-warning';
			default: return 'severity-normal';
		}
	}

	public getSeverity(alert: LabReportDto): string {
		if (this.isCritical(alert)) return 'Critical';
		if (this.isWarning(alert)) return 'Warning';
		return 'Normal';
	}

	private isWarning(report: LabReportDto): boolean {
		return (
			(report.cholesterolLevel > 200 && report.cholesterolLevel <= 240) ||
			(report.sucroseLevel > 140 && report.sucroseLevel <= 200) ||
			(report.heartBeatRatio > 90 && report.heartBeatRatio <= 100)
		);
	}

	public isUrgent(alert: LabReportDto): boolean {
		return this.getSeverity(alert) === 'Critical';
	}

	public getSeverityIcon(severity: string): string {
		switch (severity) {
			case 'Critical': return 'error';
			case 'Warning': return 'warning';
			default: return 'info';
		}
	}

	public formatTimestamp(timestamp: string): string {
		return new Date(timestamp).toLocaleString();
	}

	public viewReport(alert: LabReportDto): void {
		console.log('Viewing report:', alert.id);
	}

	public acknowledgeAlert(alert: LabReportDto): void {
		console.log('Acknowledging alert:', alert.id);
	}

	public notifyDoctor(alert: LabReportDto): void {
		console.log('Notifying doctor about alert:', alert.id);
	}

	public getValue(alert: LabReportDto): string {
		if (alert.cholesterolLevel > 240) return alert.cholesterolLevel.toString();
		if (alert.sucroseLevel > 200) return alert.sucroseLevel.toString();
		if (alert.heartBeatRatio > 100 || alert.heartBeatRatio < 60) return alert.heartBeatRatio.toString();
		return 'Multiple values';
	}

	public getUnit(alert: LabReportDto): string {
		if (alert.cholesterolLevel > 240 || alert.sucroseLevel > 200) return 'mg/dL';
		if (alert.heartBeatRatio > 100 || alert.heartBeatRatio < 60) return 'bpm';
		return '';
	}

	public getReferenceRange(alert: LabReportDto): string {
		if (alert.cholesterolLevel > 240) return '< 200 mg/dL';
		if (alert.sucroseLevel > 200) return '70-140 mg/dL';
		if (alert.heartBeatRatio > 100 || alert.heartBeatRatio < 60) return '60-100 bpm';
		return 'Within normal limits';
	}

	public isAcknowledged(alert: LabReportDto): boolean {
		return false; // Since LabReportDto doesn't have acknowledged field
	}

	public isDoctorNotified(alert: LabReportDto): boolean {
		return false; // Since LabReportDto doesn't have doctorNotified field
	}

	public getTestName(alert: LabReportDto): string {
		return alert.testPerformed;
	}

	public getPatientName(alert: LabReportDto): string {
		return `Patient ID: ${alert.patientId}`;
	}

	public getTimestamp(alert: LabReportDto): string {
		return alert.testedDate.toString();
	}
}
