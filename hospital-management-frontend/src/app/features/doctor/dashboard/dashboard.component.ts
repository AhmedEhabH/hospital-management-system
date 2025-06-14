import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AuthService } from '../../../core/services/auth.service';
import { MedicalHistoryService, MedicalHistory } from '../../../core/services/medical-history.service';
import { LabReportService, LabReport } from '../../../core/services/lab-report.service';
import { MessageService, Message } from '../../../core/services/message.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

interface Patient {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	age: number;
	gender: string;
	phoneNo: string;
	lastVisit: Date;
	status: 'Critical' | 'Stable' | 'Monitoring' | 'Discharged';
	condition: string;
}

interface Appointment {
	id: number;
	patientName: string;
	time: string;
	type: string;
	status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
	priority: 'High' | 'Medium' | 'Low';
}

@Component({
	selector: 'app-doctor-dashboard',
	standalone:false,
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

	// Dashboard Statistics
	dashboardStats = {
		totalPatients: 0,
		todayAppointments: 0,
		pendingReports: 0,
		unreadMessages: 0,
		criticalPatients: 0,
		completedToday: 0
	};

	// Patient Data
	patients: Patient[] = [];
	patientsDataSource = new MatTableDataSource<Patient>();
	patientsDisplayedColumns: string[] = ['name', 'age', 'gender', 'lastVisit', 'status', 'condition', 'actions'];

	// Appointment Data
	todayAppointments: Appointment[] = [];
	appointmentsDataSource = new MatTableDataSource<Appointment>();
	appointmentsDisplayedColumns: string[] = ['time', 'patient', 'type', 'priority', 'status', 'actions'];

	// Recent Activities
	recentActivities: any[] = [];

	// Chart Configuration for Patient Analytics
	public patientChartType: ChartType = 'doughnut';
	public patientChartData: ChartData<'doughnut'> = {
		labels: ['Critical', 'Stable', 'Monitoring', 'Discharged'],
		datasets: [{
			data: [12, 45, 23, 67],
			backgroundColor: [
				'#f44336', // Critical - Red
				'#4caf50', // Stable - Green
				'#ff9800', // Monitoring - Orange
				'#2196f3'  // Discharged - Blue
			],
			borderWidth: 2,
			borderColor: '#ffffff'
		}]
	};

	public appointmentChartType: ChartType = 'line';
	public appointmentChartData: ChartData<'line'> = {
		labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
		datasets: [{
			label: 'Appointments This Week',
			data: [12, 15, 8, 18, 22, 6, 4],
			borderColor: '#4299ed',
			backgroundColor: 'rgba(66, 153, 237, 0.1)',
			tension: 0.4,
			fill: true
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
		private medicalHistoryService: MedicalHistoryService,
		private labReportService: LabReportService,
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

		// Load Messages for unread count
		this.messageService.getInbox(this.currentUser.id)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (messages: Message[]) => {
					this.dashboardStats.unreadMessages = messages.filter((m: Message) => !m.isRead).length;
				},
				error: (error: any) => console.error('Error loading messages:', error)
			});

		// Simulate loading completion
		setTimeout(() => {
			this.isLoading = false;
		}, 1500);
	}

	private loadMockData(): void {
		// Mock patient data
		this.patients = [
			{
				id: 1,
				firstName: 'John',
				lastName: 'Doe',
				email: 'john.doe@email.com',
				age: 45,
				gender: 'Male',
				phoneNo: '+1-555-0123',
				lastVisit: new Date('2024-12-14'),
				status: 'Critical',
				condition: 'Hypertension'
			},
			{
				id: 2,
				firstName: 'Jane',
				lastName: 'Smith',
				email: 'jane.smith@email.com',
				age: 32,
				gender: 'Female',
				phoneNo: '+1-555-0124',
				lastVisit: new Date('2024-12-13'),
				status: 'Stable',
				condition: 'Diabetes Type 2'
			},
			{
				id: 3,
				firstName: 'Robert',
				lastName: 'Johnson',
				email: 'robert.j@email.com',
				age: 67,
				gender: 'Male',
				phoneNo: '+1-555-0125',
				lastVisit: new Date('2024-12-12'),
				status: 'Monitoring',
				condition: 'Post-Surgery Recovery'
			}
		];

		// Mock appointments
		this.todayAppointments = [
			{
				id: 1,
				patientName: 'John Doe',
				time: '09:00 AM',
				type: 'Follow-up',
				status: 'Scheduled',
				priority: 'High'
			},
			{
				id: 2,
				patientName: 'Jane Smith',
				time: '10:30 AM',
				type: 'Consultation',
				status: 'In Progress',
				priority: 'Medium'
			},
			{
				id: 3,
				patientName: 'Robert Johnson',
				time: '02:00 PM',
				type: 'Check-up',
				status: 'Scheduled',
				priority: 'Low'
			}
		];

		// Mock recent activities
		this.recentActivities = [
			{
				type: 'appointment',
				message: 'Completed consultation with Jane Smith',
				time: '30 minutes ago',
				icon: 'event_available'
			},
			{
				type: 'lab_report',
				message: 'New lab report available for John Doe',
				time: '1 hour ago',
				icon: 'science'
			},
			{
				type: 'message',
				message: 'New message from patient Robert Johnson',
				time: '2 hours ago',
				icon: 'mail'
			}
		];

		// Update dashboard stats
		this.dashboardStats = {
			totalPatients: this.patients.length,
			todayAppointments: this.todayAppointments.length,
			pendingReports: 5,
			unreadMessages: this.dashboardStats.unreadMessages,
			criticalPatients: this.patients.filter(p => p.status === 'Critical').length,
			completedToday: 8
		};

		// Set up data sources
		this.patientsDataSource.data = this.patients;
		this.appointmentsDataSource.data = this.todayAppointments;

		// Set up pagination and sorting after view init
		setTimeout(() => {
			if (this.paginator) {
				this.patientsDataSource.paginator = this.paginator;
			}
			if (this.sort) {
				this.patientsDataSource.sort = this.sort;
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
			case 'critical': return 'status-critical';
			case 'stable': return 'status-stable';
			case 'monitoring': return 'status-warning';
			case 'discharged': return 'status-info';
			default: return 'status-info';
		}
	}

	getPriorityClass(priority: string): string {
		switch (priority.toLowerCase()) {
			case 'high': return 'priority-high';
			case 'medium': return 'priority-medium';
			case 'low': return 'priority-low';
			default: return 'priority-medium';
		}
	}

	viewPatientDetails(patient: Patient): void {
		console.log('View patient details:', patient);
		// Navigate to patient details page
	}

	editPatientRecord(patient: Patient): void {
		console.log('Edit patient record:', patient);
		// Open edit patient dialog
	}

	startAppointment(appointment: Appointment): void {
		console.log('Start appointment:', appointment);
		// Navigate to appointment interface
	}

	completeAppointment(appointment: Appointment): void {
		console.log('Complete appointment:', appointment);
		// Mark appointment as completed
	}

	rescheduleAppointment(appointment: Appointment): void {
		console.log('Reschedule appointment:', appointment);
		// Open reschedule dialog
	}

	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.patientsDataSource.filter = filterValue.trim().toLowerCase();

		if (this.patientsDataSource.paginator) {
			this.patientsDataSource.paginator.firstPage();
		}
	}

	navigateToPatientManagement(): void {
		console.log('Navigate to patient management');
	}

	navigateToAppointments(): void {
		console.log('Navigate to appointments');
	}

	navigateToLabReports(): void {
		console.log('Navigate to lab reports');
	}

	navigateToMessages(): void {
		console.log('Navigate to messages');
	}
}
