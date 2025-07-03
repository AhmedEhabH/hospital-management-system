import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AuthService } from '../../../core/services/auth.service';
import { MessageService } from '../../../core/services/message.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import {
	DashboardStatsDto,
	FeedbackDto,
	HospitalInfoDto,
	LabReportDto,
	UserActivityDto,
	SystemAlert,
	SystemMetrics,
	AdminDashboardData,
	CurrentUser
} from '../../../core/models';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
	selector: 'app-admin-dashboard',
	standalone: false,
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;

	private destroy$ = new Subject<void>();

	// **DATA FROM BACKEND DATABASE**
	dashboardData: AdminDashboardData | null = null;
	isLoading = true;
	isDarkMode = false;
	error: string | null = null;
	currentUser: CurrentUser | null = null; // Fixed type

	// **TABLE DATA SOURCES**
	labReportsDataSource = new MatTableDataSource<LabReportDto>();
	userActivitiesDataSource = new MatTableDataSource<UserActivityDto>();
	feedbackDataSource = new MatTableDataSource<FeedbackDto>();

	// **DISPLAY COLUMNS**
	labReportsDisplayedColumns: string[] = ['patientName', 'testPerformed', 'testedBy', 'testedDate', 'status', 'actions'];
	userActivitiesDisplayedColumns: string[] = ['userName', 'userType', 'action', 'timestamp', 'status'];
	feedbackDisplayedColumns: string[] = ['userName', 'emailId', 'comments', 'createdAt', 'actions'];

	// **CHARTS CONFIGURATION**
	public systemOverviewChartType: ChartType = 'doughnut';
	public systemOverviewChartData: ChartData<'doughnut'> = {
		labels: ['Patients', 'Doctors', 'Lab Reports', 'Messages'],
		datasets: [{
			data: [0, 0, 0, 0],
			backgroundColor: [
				'#4299ed',
				'#4caf50',
				'#ff9800',
				'#9c27b0'
			],
			borderWidth: 0
		}]
	};

	public monthlyActivityChartType: ChartType = 'line';
	public monthlyActivityChartData: ChartData<'line'> = {
		labels: [],
		datasets: [{
			label: 'User Activities',
			data: [],
			borderColor: '#4299ed',
			backgroundColor: 'rgba(66, 153, 237, 0.1)',
			tension: 0.4,
			fill: true
		}]
	};

	// System Metrics
	systemMetrics: SystemMetrics = {
		totalUsers: 0,
		activeUsers: 0,
		totalDoctors: 0,
		totalPatients: 0,
		totalAdmins: 0,
		systemUptime: '0 days',
		serverLoad: 0,
		databaseSize: '0 MB',
		dailyLogins: 0,
		monthlyRegistrations: 0
	};

	// User Activity Data
	userActivities: UserActivityDto[] = [];
	activitiesDataSource = new MatTableDataSource<UserActivityDto>();
	activitiesDisplayedColumns: string[] = ['timestamp', 'user', 'userType', 'action', 'ipAddress', 'status'];

	// System Alerts
	systemAlerts: SystemAlert[] = [];

	// Chart Configuration for System Analytics
	public userDistributionChartType: ChartType = 'doughnut';
	public userDistributionChartData: ChartData<'doughnut'> = {
		labels: ['Patients', 'Doctors', 'Admins'],
		datasets: [{
			data: [150, 25, 5],
			backgroundColor: [
				'#4caf50', // Patients - Green
				'#2196f3', // Doctors - Blue
				'#ff9800'  // Admins - Orange
			],
			borderWidth: 2,
			borderColor: '#ffffff'
		}]
	};

	public systemUsageChartType: ChartType = 'line';
	public systemUsageChartData: ChartData<'line'> = {
		labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
		datasets: [
			{
				label: 'Daily Active Users',
				data: [120, 135, 142, 158, 165, 180],
				borderColor: '#4299ed',
				backgroundColor: 'rgba(66, 153, 237, 0.1)',
				tension: 0.4,
				fill: true
			},
			{
				label: 'System Load (%)',
				data: [45, 52, 48, 61, 58, 55],
				borderColor: '#ff9800',
				backgroundColor: 'rgba(255, 152, 0, 0.1)',
				tension: 0.4,
				fill: true
			}
		]
	};

	public performanceChartType: ChartType = 'bar';
	public performanceChartData: ChartData<'bar'> = {
		labels: ['Response Time', 'Database Queries', 'API Calls', 'Error Rate'],
		datasets: [{
			label: 'Performance Metrics',
			data: [85, 92, 88, 5],
			backgroundColor: [
				'#4caf50', // Good
				'#2196f3', // Excellent
				'#ff9800', // Average
				'#f44336'  // Needs Attention
			],
			borderWidth: 1
		}]
	};

	public chartOptions: ChartConfiguration['options'] = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: 'bottom',
			}
		}
	};

	constructor(
		private authService: AuthService,
		private messageService: MessageService,
		private themeService: ThemeService,
		private dashboardService: DashboardService,
	) { }

	ngOnInit(): void {
		this.initializeDashboard();
		this.subscribeToTheme();
		this.loadAdminDashboardData();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private loadAdminDashboardData(): void {
		this.isLoading = true;
		this.error = null;

		forkJoin({
			systemStats: this.dashboardService.getSystemStats(),
			recentLabReports: this.dashboardService.getCriticalLabReports(),
			userActivities: this.dashboardService.getRecentUserActivities(20),
			hospitalInfo: this.dashboardService.getHospitalInfo(),
			recentFeedback: this.dashboardService.getRecentFeedback()
		}).pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (data) => {
					this.dashboardData = {
						systemStats: data.systemStats,
						recentLabReports: data.recentLabReports.slice(0, 10),
						recentUserActivities: data.userActivities,
						hospitalInfo: data.hospitalInfo,
						recentFeedback: data.recentFeedback.slice(0, 10),
						criticalAlerts: data.recentLabReports.filter(report =>
							report.cholesterolLevel > 240 ||
							report.phLevel < 7.0 ||
							report.phLevel > 7.8
						),
						systemAlerts: this.generateMockSystemAlerts() // Generate mock alerts for now
					};

					this.setupDataSources();
					this.updateCharts();
					this.fillSystemMetrics();
					this.isLoading = false;

					console.log('Admin dashboard data loaded from database:', this.dashboardData);
				},
				error: (error) => {
					this.error = 'Failed to load admin dashboard data. Please try again.';
					this.isLoading = false;
					console.error('Error loading admin dashboard:', error);
				}
			});
	}

	private generateMockSystemAlerts(): SystemAlert[] {
		return [
			{
				id: 1,
				type: 'warning',
				message: 'Server maintenance scheduled for tonight at 2:00 AM',
				timestamp: new Date(Date.now() - 3600000),
				isRead: false,
				priority: 'medium'
			},
			{
				id: 2,
				type: 'info',
				message: 'New feature: Real-time patient monitoring is now available',
				timestamp: new Date(Date.now() - 7200000),
				isRead: false,
				priority: 'low'
			},
			{
				id: 3,
				type: 'error',
				message: 'Database backup failed - manual intervention required',
				timestamp: new Date(Date.now() - 10800000),
				isRead: true,
				priority: 'high'
			}
		];
	}

	private setupDataSources(): void {
		if (this.dashboardData) {
			this.labReportsDataSource.data = this.dashboardData.recentLabReports;
			this.userActivitiesDataSource.data = this.dashboardData.recentUserActivities;
			this.feedbackDataSource.data = this.dashboardData.recentFeedback;
			this.systemAlerts = this.dashboardData.systemAlerts;

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

	private updateCharts(): void {
		if (this.dashboardData) {
			// Update system overview chart with real data
			this.systemOverviewChartData.datasets[0].data = [
				this.dashboardData.systemStats.totalPatients,
				this.dashboardData.systemStats.totalDoctors,
				this.dashboardData.systemStats.totalLabReports,
				this.dashboardData.systemStats.pendingMessages
			];

			// Update monthly activity chart with real user activity data
			const last7Days = this.getLast7Days();
			const activityCounts = this.getActivityCountsForDays(last7Days);

			this.monthlyActivityChartData.labels = last7Days.map(date =>
				date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
			);
			this.monthlyActivityChartData.datasets[0].data = activityCounts;
		}
	}

	private getLast7Days(): Date[] {
		const days = [];
		for (let i = 6; i >= 0; i--) {
			const date = new Date();
			date.setDate(date.getDate() - i);
			days.push(date);
		}
		return days;
	}

	private getActivityCountsForDays(days: Date[]): number[] {
		if (!this.dashboardData?.recentUserActivities) return new Array(7).fill(0);

		return days.map(day => {
			const dayStart = new Date(day);
			dayStart.setHours(0, 0, 0, 0);
			const dayEnd = new Date(day);
			dayEnd.setHours(23, 59, 59, 999);

			return this.dashboardData!.recentUserActivities.filter(activity => {
				const activityDate = new Date(activity.timestamp);
				return activityDate >= dayStart && activityDate <= dayEnd;
			}).length;
		});
	}

	private initializeDashboard(): void {
		this.currentUser = this.authService.getCurrentUser();
		if (this.currentUser) {
			this.loadDashboardData();
		}
	}

	private subscribeToTheme(): void {
		this.themeService.isDarkMode$
			.pipe(takeUntil(this.destroy$))
			.subscribe(isDark => {
				this.isDarkMode = isDark;
				this.updateChartTheme();
			});
	}

	private loadDashboardData(): void {
		this.isLoading = true;

		// Simulate loading completion
		setTimeout(() => {
			this.isLoading = false;
		}, 1500);
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

	private fillSystemMetrics(): void {
		if (!this.dashboardData?.systemStats) return;

		const stats = this.dashboardData.systemStats;

		this.systemMetrics = {
			// **USE REAL DATA FROM BACKEND DashboardStatsDto**
			totalUsers: stats.totalUsers ?? ((stats.totalPatients ?? 0) + (stats.totalDoctors ?? 0) + (stats.totalAdmins ?? 0)),
			activeUsers: stats.activeUsers ?? 0,
			totalDoctors: stats.totalDoctors ?? 0,
			totalPatients: stats.totalPatients ?? 0,
			totalAdmins: stats.totalAdmins ?? 0,
			systemUptime: stats.systemUptime ?? 'Unknown',
			serverLoad: stats.serverLoad ?? 0,
			databaseSize: stats.databaseSize ?? 'Unknown',
			dailyLogins: stats.dailyLogins ?? 0,
			monthlyRegistrations: stats.monthlyRegistrations ?? 0
		};

		console.log('System metrics filled with real backend data:', this.systemMetrics);
	}

	// **USER ACTIONS**
	public refreshData(): void {
		this.loadAdminDashboardData();
	}

	getStatusClass(status: string): string {
		switch (status.toLowerCase()) {
			case 'success': return 'status-stable';
			case 'failed': return 'status-critical';
			case 'warning': return 'status-warning';
			default: return 'status-info';
		}
	}

	getAlertClass(type: string): string {
		switch (type.toLowerCase()) {
			case 'error': return 'alert-critical';
			case 'warning': return 'alert-warning';
			case 'info': return 'alert-info';
			default: return 'alert-info';
		}
	}

	getUserTypeClass(userType: string): string {
		switch (userType.toLowerCase()) {
			case 'admin': return 'user-admin';
			case 'doctor': return 'user-doctor';
			case 'patient': return 'user-patient';
			default: return 'user-patient';
		}
	}

	resolveAlert(alert: SystemAlert): void {
		alert.isRead = true; // Fixed property name
		console.log('Alert resolved:', alert);
	}

	viewUserDetails(activity: UserActivityDto): void {
		console.log('View user details:', activity);
	}

	exportSystemReport(): void {
		console.log('Export system report');
	}

	refreshSystemMetrics(): void {
		this.isLoading = true;
		setTimeout(() => {
			this.isLoading = false;
		}, 1000);
	}

	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.activitiesDataSource.filter = filterValue.trim().toLowerCase();

		if (this.activitiesDataSource.paginator) {
			this.activitiesDataSource.paginator.firstPage();
		}
	}

	navigateToUserManagement(): void {
		console.log('Navigate to user management');
	}

	navigateToSystemAnalytics(): void {
		console.log('Navigate to system analytics');
	}

	navigateToAuditLogs(): void {
		console.log('Navigate to audit logs');
	}

	navigateToSettings(): void {
		console.log('Navigate to settings');
	}

	/**
 * Gets recent activities from real database data
 */
	public getRecentActivities(): any[] {
		if (!this.dashboardData?.recentUserActivities) return [];

		return this.dashboardData.recentUserActivities.slice(0, 10).map(activity => ({
			id: activity.id,
			user: activity.userName,
			userType: activity.userType,
			action: activity.action,
			timestamp: activity.timestamp,
			status: activity.status,
			icon: this.getActivityIcon(activity.action),
			statusClass: this.getActivityStatusClass(activity.status)
		}));
	}

	/**
 * Gets CSS class for activity status
 */
	public getActivityStatusClass(status: string): string {
		switch (status?.toLowerCase()) {
			case 'success': return 'status-stable';
			case 'completed': return 'status-stable';
			case 'failed': return 'status-critical';
			case 'error': return 'status-critical';
			case 'warning': return 'status-warning';
			case 'pending': return 'status-info';
			case 'in progress': return 'status-warning';
			default: return 'status-info';
		}
	}


	/**
	 * Gets appropriate icon for activity type
	 */
	private getActivityIcon(action: string): string {
		if (action.includes('login')) return 'login';
		if (action.includes('lab report')) return 'science';
		if (action.includes('medical history')) return 'medical_information';
		if (action.includes('message')) return 'mail';
		if (action.includes('appointment')) return 'event';
		return 'activity';
	}

	/**
	 * Refreshes recent activities
	 */
	public refreshActivities(): void {
		this.loadAdminDashboardData();
	}

}
