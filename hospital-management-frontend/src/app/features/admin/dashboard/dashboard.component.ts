import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AuthService } from '../../../core/services/auth.service';
import { MessageService, Message } from '../../../core/services/message.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

interface SystemMetrics {
	totalUsers: number;
	activeUsers: number;
	totalDoctors: number;
	totalPatients: number;
	totalAdmins: number;
	systemUptime: string;
	serverLoad: number;
	databaseSize: string;
	dailyLogins: number;
	monthlyRegistrations: number;
}

interface UserActivity {
	id: number;
	userName: string;
	userType: string;
	action: string;
	timestamp: Date;
	ipAddress: string;
	status: 'Success' | 'Failed' | 'Warning';
}

interface SystemAlert {
	id: number;
	type: 'Critical' | 'Warning' | 'Info';
	message: string;
	timestamp: Date;
	resolved: boolean;
}

@Component({
	selector: 'app-admin-dashboard',
	standalone: false,
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;

	private destroy$ = new Subject<void>();

	currentUser: any;
	isDarkMode = false;
	isLoading = true;

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
	userActivities: UserActivity[] = [];
	activitiesDataSource = new MatTableDataSource<UserActivity>();
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
		private themeService: ThemeService
	) { }

	ngOnInit(): void {
		this.initializeDashboard();
		this.subscribeToTheme();
		this.loadMockData();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
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

	private loadMockData(): void {
		// Mock system metrics
		this.systemMetrics = {
			totalUsers: 180,
			activeUsers: 145,
			totalDoctors: 25,
			totalPatients: 150,
			totalAdmins: 5,
			systemUptime: '45 days',
			serverLoad: 65,
			databaseSize: '2.4 GB',
			dailyLogins: 89,
			monthlyRegistrations: 23
		};

		// Mock user activities
		this.userActivities = [
			{
				id: 1,
				userName: 'Dr. Smith',
				userType: 'Doctor',
				action: 'Viewed patient record',
				timestamp: new Date('2024-12-15T10:30:00'),
				ipAddress: '192.168.1.100',
				status: 'Success'
			},
			{
				id: 2,
				userName: 'John Doe',
				userType: 'Patient',
				action: 'Updated medical history',
				timestamp: new Date('2024-12-15T10:25:00'),
				ipAddress: '192.168.1.101',
				status: 'Success'
			},
			{
				id: 3,
				userName: 'Admin User',
				userType: 'Admin',
				action: 'System configuration change',
				timestamp: new Date('2024-12-15T10:20:00'),
				ipAddress: '192.168.1.102',
				status: 'Warning'
			},
			{
				id: 4,
				userName: 'Dr. Johnson',
				userType: 'Doctor',
				action: 'Failed login attempt',
				timestamp: new Date('2024-12-15T10:15:00'),
				ipAddress: '192.168.1.103',
				status: 'Failed'
			}
		];

		// Mock system alerts
		this.systemAlerts = [
			{
				id: 1,
				type: 'Warning',
				message: 'High server load detected (85%)',
				timestamp: new Date('2024-12-15T10:30:00'),
				resolved: false
			},
			{
				id: 2,
				type: 'Info',
				message: 'Database backup completed successfully',
				timestamp: new Date('2024-12-15T09:00:00'),
				resolved: true
			},
			{
				id: 3,
				type: 'Critical',
				message: 'Multiple failed login attempts detected',
				timestamp: new Date('2024-12-15T08:45:00'),
				resolved: false
			}
		];

		// Set up data sources
		this.activitiesDataSource.data = this.userActivities;

		// Set up pagination and sorting after view init
		setTimeout(() => {
			if (this.paginator) {
				this.activitiesDataSource.paginator = this.paginator;
			}
			if (this.sort) {
				this.activitiesDataSource.sort = this.sort;
			}
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
			case 'critical': return 'alert-critical';
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
		alert.resolved = true;
		console.log('Alert resolved:', alert);
	}

	viewUserDetails(activity: UserActivity): void {
		console.log('View user details:', activity);
	}

	exportSystemReport(): void {
		console.log('Export system report');
	}

	refreshSystemMetrics(): void {
		this.isLoading = true;
		setTimeout(() => {
			this.loadMockData();
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
}
