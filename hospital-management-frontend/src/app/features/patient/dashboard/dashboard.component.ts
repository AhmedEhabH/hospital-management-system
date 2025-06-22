import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MedicalHistoryService } from '../../../core/services/medical-history.service';
import { LabReportService } from '../../../core/services/lab-report.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { LabReportDto, MedicalHistoryDto, MessageDto, PatientDashboardData } from '../../../core/models';
import { DashboardService } from '../../../core/services/dashboard.service';
import { Subject, takeUntil } from 'rxjs';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
	selector: 'app-dashboard',
	standalone: false,
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})

export class PatientDashboardComponent implements OnInit, OnDestroy {
	// **DATA FROM BACKEND**
	dashboardData: PatientDashboardData | null = null;
	isLoading = true;
	error: string | null = null;
	isDarkMode: boolean = false;

	// **COMPUTED PROPERTIES**
	get recentLabReports(): LabReportDto[] {
		return this.dashboardData?.labReports?.slice(0, 5) || [];
	}

	get unreadMessages(): MessageDto[] {
		return this.dashboardData?.messages?.filter(m => !m.isRead) || [];
	}

	get criticalAlerts(): LabReportDto[] {
		return this.dashboardData?.labReports?.filter(report =>
			report.cholesterolLevel > 240 ||
			report.phLevel < 7.0 ||
			report.phLevel > 7.8
		) || [];
	}

	private destroy$ = new Subject<void>();

	constructor(
		private dashboardService: DashboardService,
		private authService: AuthService,
		private themeService: ThemeService
	) { }

	ngOnInit(): void {
		this.loadDashboardData();
		this.subscribeToRealTimeUpdates();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private loadTheme(): void {
		this.themeService.isDarkMode$.pipe(takeUntil(this.destroy$)).subscribe(isDark => this.isDarkMode = isDark);
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

	private subscribeToRealTimeUpdates(): void {
		// **REAL-TIME DATA UPDATES**
		this.dashboardService.patientData$
			.pipe(takeUntil(this.destroy$))
			.subscribe(data => {
				if (data) {
					this.dashboardData = data;
				}
			});
	}

	// **USER ACTIONS**
	public refreshData(): void {
		const currentUser = this.authService.getCurrentUser();
		if (currentUser) {
			this.dashboardService.refreshPatientData(currentUser.id);
		}
	}

	public viewLabReport(reportId: number): void {
		// Navigate to lab report details
		console.log('Viewing lab report:', reportId);
	}

	public viewMedicalHistory(): void {
		// Navigate to medical history
		console.log('Viewing medical history');
	}

	public composeMessage(): void {
		// Navigate to message composer
		console.log('Composing message');
	}
}
