import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { MedicalHistoryService, MedicalHistory } from '../../../core/services/medical-history.service';
import { LabReportService, LabReport } from '../../../core/services/lab-report.service';
import { MessageService, Message } from '../../../core/services/message.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
	selector: 'app-patient-dashboard',
	standalone: false,
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();

	currentUser: any;
	isDarkMode = false;
	isLoading = true;

	// Dashboard Data
	medicalHistory: MedicalHistory[] = [];
	recentLabReports: LabReport[] = [];
	unreadMessages = 0;
	upcomingAppointments: any[] = [];

	// Health Metrics
	healthMetrics = {
		bloodPressure: { systolic: 120, diastolic: 80, status: 'Normal' },
		heartRate: { value: 72, status: 'Normal' },
		weight: { value: 70, unit: 'kg', trend: 'stable' },
		temperature: { value: 36.5, unit: '°C', status: 'Normal' }
	};

	// Chart Configuration
	public chartType: ChartType = 'line';
	public chartData: ChartData<'line'> = {
		labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
		datasets: [
			{
				label: 'Blood Pressure (Systolic)',
				data: [120, 118, 122, 119, 121, 120],
				borderColor: '#4299ed',
				backgroundColor: 'rgba(66, 153, 237, 0.1)',
				tension: 0.4
			},
			{
				label: 'Heart Rate',
				data: [72, 75, 70, 73, 71, 72],
				borderColor: '#4caf50',
				backgroundColor: 'rgba(76, 175, 80, 0.1)',
				tension: 0.4
			}
		]
	};

	public chartOptions: ChartConfiguration['options'] = {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			y: {
				beginAtZero: false,
				grid: {
					color: 'rgba(0,0,0,0.1)'
				}
			},
			x: {
				grid: {
					color: 'rgba(0,0,0,0.1)'
				}
			}
		},
		plugins: {
			legend: {
				position: 'top',
			}
		}
	};

	constructor(
		private authService: AuthService,
		private medicalHistoryService: MedicalHistoryService,
		private labReportService: LabReportService,
		private messageService: MessageService,
		private themeService: ThemeService
	) { }

	ngOnInit(): void {
		this.initializeDashboard();
		this.subscribeToTheme();
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

		// Load Medical History
		this.medicalHistoryService.getMedicalHistoriesByUserId(this.currentUser.id)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (history: MedicalHistory[]) => {
					this.medicalHistory = history.slice(0, 3); // Show recent 3
				},
				error: (error: any) => console.error('Error loading medical history:', error)
			});

		// Load Lab Reports
		this.labReportService.getLabReportsByPatientId(this.currentUser.id)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (reports: LabReport[]) => {
					this.recentLabReports = reports.slice(0, 3); // Show recent 3
				},
				error: (error: any) => console.error('Error loading lab reports:', error)
			});

		// Load Messages
		this.messageService.getInbox(this.currentUser.id)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (messages: Message[]) => {
					this.unreadMessages = messages.filter((m: Message) => !m.isRead).length;
				},
				error: (error: any) => console.error('Error loading messages:', error)
			});

		// Simulate loading completion
		setTimeout(() => {
			this.isLoading = false;
		}, 1500);
	}

	private updateChartTheme(): void {
		if (this.chartOptions && this.chartOptions.scales) {
			const gridColor = this.isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
			this.chartOptions.scales['y']!.grid!.color = gridColor;
			this.chartOptions.scales['x']!.grid!.color = gridColor;
		}
	}

	getHealthStatusClass(status: string): string {
		switch (status.toLowerCase()) {
			case 'normal': return 'status-stable';
			case 'high': return 'status-warning';
			case 'critical': return 'status-critical';
			default: return 'status-info';
		}
	}

	navigateToMedicalHistory(): void {
		// Navigate to medical history page
		console.log('Navigate to medical history');
	}

	navigateToLabReports(): void {
		// Navigate to lab reports page
		console.log('Navigate to lab reports');
	}

	navigateToMessages(): void {
		// Navigate to messages page
		console.log('Navigate to messages');
	}

	scheduleAppointment(): void {
		// Navigate to appointment scheduling
		console.log('Schedule appointment');
	}
}
