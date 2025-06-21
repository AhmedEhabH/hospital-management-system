import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MedicalHistoryService } from '../../../core/services/medical-history.service';
import { LabReportService } from '../../../core/services/lab-report.service';
import { MedicalHistoryDto } from '../../../core/models/medical-history.model';
import { LabReportDto } from '../../../core/models/lab-report.model';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
	selector: 'app-dashboard',
	standalone: false,
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
	currentUser: any;
	medicalHistories: MedicalHistoryDto[] = [];
	recentLabReports: LabReportDto[] = [];
	loading = false;

	// Health metrics and other properties
	isDarkMode = false;
	unreadMessages = 0;
	healthMetrics = {
		bloodPressure: {
			systolic: 120,
			diastolic: 80,
			status: 'Normal'
		},
		heartRate: {
			value: 72,
			status: 'Normal'
		},
		weight: {
			value: 70,
			unit: 'kg',
			trend: 'Stable'
		},
		temperature: {
			value: 36.5,
			unit: '°C',
			status: 'Normal'
		}
	};

	// Chart properties
	chartType: ChartType = 'line';
	chartData: ChartData<'line'> = {
		labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
		datasets: [
			{
				label: 'Blood Pressure (Systolic)',
				data: [120, 118, 125, 122, 119, 121],
				borderColor: '#4299ed',
				backgroundColor: 'rgba(66, 153, 237, 0.1)',
				tension: 0.4
			},
			{
				label: 'Heart Rate',
				data: [72, 75, 70, 73, 71, 74],
				borderColor: '#4caf50',
				backgroundColor: 'rgba(76, 175, 80, 0.1)',
				tension: 0.4
			}
		]
	};

	chartOptions: ChartConfiguration['options'] = {
		responsive: true,
		plugins: {
			legend: {
				display: true,
				position: 'top'
			}
		},
		scales: {
			y: {
				beginAtZero: false
			}
		}
	};

	constructor(
		private authService: AuthService,
		private medicalHistoryService: MedicalHistoryService,
		private labReportService: LabReportService,
		private router: Router
	) { }

	ngOnInit(): void {
		this.currentUser = this.authService.getCurrentUser();
		this.loadMedicalHistory();
		this.loadRecentLabReports();
		this.loadHealthMetrics();
		this.loadUnreadMessages();
		this.checkTheme();
	}

	private loadMedicalHistory(): void {
		if (this.currentUser?.id) {
			this.loading = true;
			this.medicalHistoryService.getMedicalHistoryByUserId(this.currentUser.id)
				.subscribe({
					next: (histories) => {
						this.medicalHistories = histories;
						this.loading = false;
					},
					error: (error: any) => {
						console.error('Error loading medical history:', error);
						this.loading = false;
					}
				});
		}
	}

	private loadRecentLabReports(): void {
		if (this.currentUser?.id) {
			this.labReportService.getLabReportsByPatientId(this.currentUser.id)
				.subscribe({
					next: (reports: LabReportDto[]) => {
						this.recentLabReports = reports
							.sort((a: LabReportDto, b: LabReportDto) =>
								new Date(b.testedDate).getTime() - new Date(a.testedDate).getTime())
							.slice(0, 3);
					},
					error: (error: any) => {
						console.error('Error loading lab reports:', error);
						this.recentLabReports = [];
					}
				});
		}
	}

	private loadHealthMetrics(): void {
		this.healthMetrics = {
			bloodPressure: {
				systolic: 120,
				diastolic: 80,
				status: 'Normal'
			},
			heartRate: {
				value: 72,
				status: 'Normal'
			},
			weight: {
				value: 70,
				unit: 'kg',
				trend: 'Stable'
			},
			temperature: {
				value: 36.5,
				unit: '°C',
				status: 'Normal'
			}
		};
	}

	private loadUnreadMessages(): void {
		this.unreadMessages = 3;
	}

	private checkTheme(): void {
		this.isDarkMode = document.body.classList.contains('dark-theme');
	}

	// Navigation methods
	public scheduleAppointment(): void {
		this.router.navigate(['/appointments/schedule']);
	}

	public navigateToMessages(): void {
		this.router.navigate(['/messages']);
	}

	public navigateToMedicalHistory(): void {
		this.router.navigate(['/medical-history']);
	}

	public navigateToLabReports(): void {
		this.router.navigate(['/lab-reports']);
	}

	// FIXED: Make lab report utility methods public
	public getLabReportStatusClass(report: LabReportDto): string {
		if (this.isLabReportCritical(report)) {
			return 'status-critical';
		} else if (this.isLabReportWarning(report)) {
			return 'status-warning';
		}
		return 'status-stable';
	}

	public getLabReportIcon(report: LabReportDto): string {
		const testType = report.testPerformed.toLowerCase();

		if (testType.includes('blood')) return 'bloodtype';
		if (testType.includes('urine')) return 'local_hospital';
		if (testType.includes('x-ray') || testType.includes('scan')) return 'medical_services';
		if (testType.includes('ecg') || testType.includes('heart')) return 'favorite';

		return 'science';
	}

	// FIXED: Make these methods public for template access
	public isLabReportCritical(report: LabReportDto): boolean {
		return (
			report.cholesterolLevel > 240 ||
			report.sucroseLevel > 200 ||
			report.whiteBloodCellsRatio > 11000 ||
			report.whiteBloodCellsRatio < 4000 ||
			report.heartBeatRatio > 100 ||
			report.heartBeatRatio < 60
		);
	}

	public isLabReportWarning(report: LabReportDto): boolean {
		return (
			(report.cholesterolLevel > 200 && report.cholesterolLevel <= 240) ||
			(report.sucroseLevel > 140 && report.sucroseLevel <= 200) ||
			(report.heartBeatRatio > 90 && report.heartBeatRatio <= 100) ||
			(report.heartBeatRatio >= 60 && report.heartBeatRatio < 70)
		);
	}

	// Utility methods
	public getHealthStatusClass(status: string): string {
		switch (status.toLowerCase()) {
			case 'normal':
				return 'status-stable';
			case 'high':
			case 'elevated':
				return 'status-warning';
			case 'critical':
			case 'low':
				return 'status-critical';
			default:
				return 'status-info';
		}
	}

	// Helper methods for medical history display
	public getHistoryTitle(history: MedicalHistoryDto): string {
		if (history.frequentlyOccurringDisease) {
			return `Condition: ${history.frequentlyOccurringDisease}`;
		}
		if (history.allergies) {
			return `Allergies: ${history.allergies}`;
		}
		return 'Medical History Update';
	}

	public getHistoryDescription(history: MedicalHistoryDto): string {
		const conditions = [];

		if (history.hasAsthma) conditions.push('Asthma');
		if (history.hasBloodPressure) conditions.push('High Blood Pressure');
		if (history.hasCholesterol) conditions.push('High Cholesterol');
		if (history.hasDiabetes) conditions.push('Diabetes');
		if (history.hasHeartDisease) conditions.push('Heart Disease');

		if (conditions.length > 0) {
			return `Active conditions: ${conditions.join(', ')}`;
		}

		return history.personalHistory || 'General medical history entry';
	}

	public getHistoryIcon(history: MedicalHistoryDto): string {
		if (history.hasHeartDisease) return 'favorite';
		if (history.hasAsthma) return 'air';
		if (history.hasBloodPressure) return 'monitor_heart';
		if (history.hasDiabetes) return 'bloodtype';
		if (history.allergies) return 'warning';
		return 'medical_services';
	}

	public getHistoryIconClass(history: MedicalHistoryDto): string {
		if (history.hasHeartDisease || history.hasDiabetes) return 'critical-icon';
		if (history.hasBloodPressure || history.hasAsthma) return 'warning-icon';
		if (history.allergies) return 'alert-icon';
		return 'info-icon';
	}

	// Getter for template compatibility
	get isLoading(): boolean {
		return this.loading;
	}

	get medicalHistory(): MedicalHistoryDto[] {
		return this.medicalHistories;
	}
}
