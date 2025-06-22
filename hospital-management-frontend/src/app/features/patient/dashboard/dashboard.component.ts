import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MedicalHistoryService } from '../../../core/services/medical-history.service';
import { LabReportService } from '../../../core/services/lab-report.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { LabReportDto, MedicalHistoryDto, MessageDto, PatientDashboardData, HealthTrend } from '../../../core/models';
import { DashboardService } from '../../../core/services/dashboard.service';
import { Subject, takeUntil } from 'rxjs';
import { ThemeService } from '../../../core/services/theme.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

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

	// **DATA FROM BACKEND**
	dashboardData: PatientDashboardData | null = null;
	isLoading = true;
	isDarkMode = false;
	error: string | null = null;

	// **DASHBOARD STATISTICS**
	dashboardStats = {
		totalLabReports: 0,
		criticalAlerts: 0,
		unreadMessages: 0,
		upcomingAppointments: 0,
		completedAppointments: 0,
		healthScore: 85
	};

	// **TABLE DATA SOURCES**
	labReportsDataSource = new MatTableDataSource<LabReportDto>();
	appointmentsDataSource = new MatTableDataSource<any>();
	labReportsDisplayedColumns: string[] = ['testPerformed', 'testedBy', 'testedDate', 'status', 'actions'];
	appointmentsDisplayedColumns: string[] = ['date', 'time', 'doctor', 'department', 'type', 'status'];

	// **HEALTH TRENDS CHART**
	public healthTrendsChartType: ChartType = 'line';
	public healthTrendsChartData: ChartData<'line'> = {
		labels: [],
		datasets: [
			{
				label: 'Blood Pressure (Systolic)',
				data: [],
				borderColor: '#f44336',
				backgroundColor: 'rgba(244, 67, 54, 0.1)',
				tension: 0.4,
				fill: false
			},
			{
				label: 'Heart Rate',
				data: [],
				borderColor: '#4caf50',
				backgroundColor: 'rgba(76, 175, 80, 0.1)',
				tension: 0.4,
				fill: false
			},
			{
				label: 'Weight',
				data: [],
				borderColor: '#2196f3',
				backgroundColor: 'rgba(33, 150, 243, 0.1)',
				tension: 0.4,
				fill: false
			}
		]
	};

	public chartOptions: ChartConfiguration['options'] = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: 'bottom'
			}
		},
		scales: {
			y: {
				beginAtZero: true
			}
		}
	};

	constructor(
		private dashboardService: DashboardService,
		private authService: AuthService,
		private themeService: ThemeService
	) { }

	ngOnInit(): void {
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
			// Update chart colors based on theme
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
		const currentUser = this.authService.getCurrentUser();

		if (!currentUser) {
			this.error = 'User not authenticated';
			this.isLoading = false;
			return;
		}

		this.isLoading = true;
		this.error = null;

		// **FETCH ALL DATA FROM BACKEND**
		this.dashboardService.getPatientDashboardData(currentUser.id)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (data) => {
					this.dashboardData = data;
					this.updateDashboardStats();
					this.setupDataSources();
					this.loadHealthTrends();
					this.isLoading = false;
					console.log('Patient dashboard data loaded:', data);
				},
				error: (error) => {
					this.error = 'Failed to load dashboard data. Please try again.';
					this.isLoading = false;
					console.error('Error loading patient dashboard:', error);
				}
			});
	}

	private loadHealthTrends(): void {
		const currentUser = this.authService.getCurrentUser();
		if (!currentUser) return;

		// Load health trends from backend
		this.dashboardService.getPatientHealthTrends(currentUser.id, 30)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (trends) => {
					this.updateHealthTrendsChart(trends);
				},
				error: (error) => {
					console.error('Error loading health trends:', error);
					// Use mock data as fallback
					this.updateHealthTrendsChartWithMockData();
				}
			});
	}

	private updateHealthTrendsChart(trends: any[]): void {
		if (trends && trends.length > 0) {
			this.healthTrendsChartData.labels = trends.map((_, index) =>
				new Date(Date.now() - (trends.length - index - 1) * 24 * 60 * 60 * 1000).toLocaleDateString()
			);

			this.healthTrendsChartData.datasets[0].data = trends.map(t => t.bloodPressure.systolic);
			this.healthTrendsChartData.datasets[1].data = trends.map(t => t.heartRate.value);
			this.healthTrendsChartData.datasets[2].data = trends.map(t => t.weight.value);
		} else {
			this.updateHealthTrendsChartWithMockData();
		}
	}

	private updateHealthTrendsChartWithMockData(): void {
		// Mock health trends data as fallback
		const mockTrends: HealthTrend[] = [
			{ date: '2024-12-01', bloodPressureSystolic: 120, bloodPressureDiastolic: 80, heartRate: 72, weight: 70, temperature: 36.5 },
			{ date: '2024-12-08', bloodPressureSystolic: 118, bloodPressureDiastolic: 78, heartRate: 75, weight: 69.5, temperature: 36.6 },
			{ date: '2024-12-15', bloodPressureSystolic: 122, bloodPressureDiastolic: 82, heartRate: 70, weight: 70.2, temperature: 36.4 },
			{ date: '2024-12-22', bloodPressureSystolic: 119, bloodPressureDiastolic: 79, heartRate: 73, weight: 69.8, temperature: 36.5 }
		];

		this.healthTrendsChartData.labels = mockTrends.map(t => t.date);
		this.healthTrendsChartData.datasets[0].data = mockTrends.map(t => t.bloodPressureSystolic);
		this.healthTrendsChartData.datasets[1].data = mockTrends.map(t => t.heartRate);
		this.healthTrendsChartData.datasets[2].data = mockTrends.map(t => t.weight);
	}

	private updateDashboardStats(): void {
		if (this.dashboardData) {
			this.dashboardStats = {
				totalLabReports: this.dashboardData.labReports.length,
				criticalAlerts: this.getCriticalAlerts().length,
				unreadMessages: this.getUnreadMessages().length,
				upcomingAppointments: this.dashboardData.upcomingAppointments.length,
				completedAppointments: this.getCompletedAppointments().length,
				healthScore: this.calculateHealthScore()
			};
		}
	}

	private setupDataSources(): void {
		if (this.dashboardData) {
			this.labReportsDataSource.data = this.dashboardData.labReports;
			this.appointmentsDataSource.data = this.dashboardData.upcomingAppointments;

			// Setup pagination after view init
			setTimeout(() => {
				if (this.paginator) {
					this.labReportsDataSource.paginator = this.paginator;
				}
				if (this.sort) {
					this.labReportsDataSource.sort = this.sort;
				}
			});
		}
	}

	// **COMPUTED PROPERTIES**
	get recentLabReports(): LabReportDto[] {
		return this.dashboardData?.labReports?.slice(0, 5) || [];
	}

	get unreadMessages(): MessageDto[] {
		return this.getUnreadMessages();
	}

	get criticalAlerts(): LabReportDto[] {
		return this.getCriticalAlerts();
	}

	private getUnreadMessages(): MessageDto[] {
		return this.dashboardData?.messages?.filter(m => !m.isRead) || [];
	}

	private getCriticalAlerts(): LabReportDto[] {
		return this.dashboardData?.labReports?.filter(report =>
			report.cholesterolLevel > 240 ||
			report.phLevel < 7.0 ||
			report.phLevel > 7.8
		) || [];
	}

	private getCompletedAppointments(): any[] {
		return this.dashboardData?.upcomingAppointments?.filter(a => a.status === 'Completed') || [];
	}

	private calculateHealthScore(): number {
		if (!this.dashboardData?.healthMetrics) return 85;

		let score = 100;
		const metrics = this.dashboardData.healthMetrics;

		// Deduct points for abnormal values
		if (metrics.bloodPressure.status !== 'Normal') score -= 15;
		if (metrics.heartRate.status !== 'Normal') score -= 10;
		if (metrics.temperature.status !== 'Normal') score -= 20;

		return Math.max(score, 0);
	}

	// **USER ACTIONS**
	public refreshData(): void {
		this.loadDashboardData();
	}

	public viewLabReport(reportId: number): void {
		console.log('Viewing lab report:', reportId);
		// Navigate to lab report details
	}

	public viewMedicalHistory(): void {
		console.log('Viewing medical history');
		// Navigate to medical history
	}

	public composeMessage(): void {
		console.log('Composing message');
		// Navigate to message composer
	}

	public scheduleAppointment(): void {
		console.log('Scheduling appointment');
		// Navigate to appointment scheduler
	}

	public viewAppointment(appointment: any): void {
		console.log('Viewing appointment:', appointment);
		// Navigate to appointment details
	}

	public getLabStatusClass(report: LabReportDto): string {
		if (report.cholesterolLevel > 240 || report.phLevel < 7.0 || report.phLevel > 7.8) {
			return 'status-critical';
		}
		return 'status-stable';
	}

	public getLabStatusText(report: LabReportDto): string {
		if (report.cholesterolLevel > 240 || report.phLevel < 7.0 || report.phLevel > 7.8) {
			return 'Critical';
		}
		return 'Normal';
	}

	public getAppointmentStatusClass(status: string): string {
		switch (status?.toLowerCase()) {
			case 'scheduled': return 'status-info';
			case 'in progress': return 'status-warning';
			case 'completed': return 'status-stable';
			case 'cancelled': return 'status-critical';
			default: return 'status-info';
		}
	}

	public applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.labReportsDataSource.filter = filterValue.trim().toLowerCase();

		if (this.labReportsDataSource.paginator) {
			this.labReportsDataSource.paginator.firstPage();
		}
	}
}
