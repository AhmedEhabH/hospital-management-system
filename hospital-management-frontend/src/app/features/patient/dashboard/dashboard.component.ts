import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MedicalHistoryService } from '../../../core/services/medical-history.service';
import { LabReportService } from '../../../core/services/lab-report.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { ThemeService } from '../../../core/services/theme.service';
import { MedicalHistoryDto } from '../../../core/models/medical-history.model';
import { LabReportDto } from '../../../core/models/lab-report.model';
import { PatientDashboardData } from '../../../core/models';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, takeUntil, forkJoin } from 'rxjs';

@Component({
	selector: 'app-dashboard',
	standalone: false,
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})
export class PatientDashboardComponent implements OnInit, OnDestroy {
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;

	private destroy$ = new Subject<void>();

	// Core data properties
	currentUser: any;
	dashboardData: PatientDashboardData | null = null;
	medicalHistories: MedicalHistoryDto[] = [];
	recentLabReports: LabReportDto[] = [];

	// UI state
	loading = false;
	isDarkMode = false;
	error: string | null = null;
	unreadMessages = 0;

	// Dashboard metrics derived from actual data
	DashboardStatsDto = {
		totalLabReports: 0,
		criticalAlerts: 0,
		unreadMessages: 0,
		upcomingAppointments: 0,
		completedAppointments: 0,
		healthScore: 85
	};

	// Health metrics from dashboard data
	healthMetrics = {
		bloodPressure: {
			systolic: 0,
			diastolic: 0,
			status: 'Loading...'
		},
		heartRate: {
			value: 0,
			status: 'Loading...'
		},
		weight: {
			value: 0,
			unit: 'kg',
			trend: 'Loading...'
		},
		temperature: {
			value: 0,
			unit: '°C',
			status: 'Loading...'
		}
	};

	// Table data sources
	labReportsDataSource = new MatTableDataSource<LabReportDto>();
	labReportsDisplayedColumns: string[] = ['testPerformed', 'testedBy', 'testedDate', 'status', 'actions'];

	// Chart configuration
	chartType: ChartType = 'line';
	chartData: ChartData<'line'> = {
		labels: ['Last 30 Days', 'Last 20 Days', 'Last 10 Days', 'Today'],
		datasets: [
			{
				label: 'Blood Pressure (Systolic)',
				data: [],
				borderColor: '#4299ed',
				backgroundColor: 'rgba(66, 153, 237, 0.1)',
				tension: 0.4
			},
			{
				label: 'Heart Rate',
				data: [],
				borderColor: '#4caf50',
				backgroundColor: 'rgba(76, 175, 80, 0.1)',
				tension: 0.4
			}
		]
	};

	chartOptions: ChartConfiguration['options'] = {
		responsive: true,
		maintainAspectRatio: false,
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
		private dashboardService: DashboardService,
		private themeService: ThemeService,
		private router: Router
	) { }

	ngOnInit(): void {
		this.currentUser = this.authService.getCurrentUser();
		this.subscribeToTheme();
		this.loadDashboardData();
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
				this.updateChartTheme();
			});
	}

	private updateChartTheme(): void {
		if (this.chartOptions && this.chartOptions.plugins) {
			const textColor = this.isDarkMode ? '#ffffff' : '#212121';
			this.chartOptions.plugins.legend = {
				...this.chartOptions.plugins.legend,
				labels: {
					color: textColor
				}
			};
		}
	}

	private loadDashboardData(): void {
		if (!this.currentUser?.id) {
			this.error = 'User not authenticated';
			return;
		}

		this.loading = true;
		this.error = null;

		// Load dashboard data using the PatientDashboardData interface
		this.dashboardService.getPatientDashboardData(this.currentUser.id)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (data: PatientDashboardData) => {
					this.dashboardData = data;
					this.medicalHistories = data.medicalHistory || [];
					this.recentLabReports = (data.labReports || [])
						.sort((a, b) => new Date(b.testedDate).getTime() - new Date(a.testedDate).getTime())
						.slice(0, 3);

					this.updateHealthMetrics();
					this.updateDashboardStatsDto();
					this.setupDataSources();
					this.updateChartData();
					this.loading = false;
				},
				error: (error) => {
					console.error('Error loading dashboard data:', error);
					this.error = 'Failed to load dashboard data. Please try again.';
					this.loading = false;
				}
			});
	}

	private updateHealthMetrics(): void {
		if (this.dashboardData?.healthMetrics) {
			const metrics = this.dashboardData.healthMetrics;
			this.healthMetrics = {
				bloodPressure: {
					systolic: metrics.bloodPressure?.systolic || 120,
					diastolic: metrics.bloodPressure?.diastolic || 80,
					status: metrics.bloodPressure?.status || 'Normal'
				},
				heartRate: {
					value: metrics.heartRate?.value || 72,
					status: metrics.heartRate?.status || 'Normal'
				},
				weight: {
					value: metrics.weight?.value || 70,
					unit: metrics.weight?.unit || 'kg',
					trend: metrics.weight?.trend || 'Stable'
				},
				temperature: {
					value: metrics.temperature?.value || 36.5,
					unit: metrics.temperature?.unit || '°C',
					status: metrics.temperature?.status || 'Normal'
				}
			};
		}
	}

	private updateDashboardStatsDto(): void {
		if (this.dashboardData) {
			this.DashboardStatsDto = {
				totalLabReports: this.dashboardData.labReports?.length || 0,
				criticalAlerts: this.getCriticalAlerts().length,
				unreadMessages: this.dashboardData.messages?.filter(m => !m.isRead).length || 0,
				upcomingAppointments: this.dashboardData.upcomingAppointments?.length || 0,
				completedAppointments: this.dashboardData.upcomingAppointments?.filter(a => a.status === 'Completed').length || 0,
				healthScore: this.calculateHealthScore()
			};
			this.unreadMessages = this.DashboardStatsDto.unreadMessages;
		}
	}

	private setupDataSources(): void {
		this.labReportsDataSource.data = this.recentLabReports;

		setTimeout(() => {
			if (this.paginator) {
				this.labReportsDataSource.paginator = this.paginator;
			}
			if (this.sort) {
				this.labReportsDataSource.sort = this.sort;
			}
		});
	}

	private updateChartData(): void {
		// Create chart data from recent lab reports
		if (this.recentLabReports.length > 0) {
			const labels = this.recentLabReports.map(report =>
				new Date(report.testedDate).toLocaleDateString()
			).reverse();

			const systolicData = this.recentLabReports.map(report =>
				report.heartBeatRatio || 120
			).reverse();

			const heartRateData = this.recentLabReports.map(report =>
				report.heartBeatRatio || 72
			).reverse();

			this.chartData.labels = labels;
			this.chartData.datasets[0].data = systolicData;
			this.chartData.datasets[1].data = heartRateData;
		}
	}

	private getCriticalAlerts(): LabReportDto[] {
		return this.recentLabReports.filter(report => this.isLabReportCritical(report));
	}

	private calculateHealthScore(): number {
		if (!this.healthMetrics) return 85;

		let score = 100;
		if (this.healthMetrics.bloodPressure.status !== 'Normal') score -= 15;
		if (this.healthMetrics.heartRate.status !== 'Normal') score -= 10;
		if (this.healthMetrics.temperature.status !== 'Normal') score -= 20;

		return Math.max(score, 0);
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

	public refreshData(): void {
		this.loadDashboardData();
	}

	// Lab report utility methods
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

	// Medical history helper methods
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

	public applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.labReportsDataSource.filter = filterValue.trim().toLowerCase();

		if (this.labReportsDataSource.paginator) {
			this.labReportsDataSource.paginator.firstPage();
		}
	}

	// Getters for template compatibility
	get isLoading(): boolean {
		return this.loading;
	}

	get medicalHistory(): MedicalHistoryDto[] {
		return this.medicalHistories;
	}
}
