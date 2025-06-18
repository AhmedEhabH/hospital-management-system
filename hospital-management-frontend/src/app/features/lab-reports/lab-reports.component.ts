import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LabReportService, LabReport } from '../../core/services/lab-report.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ExportService } from '../../core/services/export.service';

@Component({
	selector: 'app-lab-reports',
	standalone:false,
	templateUrl: './lab-reports.component.html',
	styleUrls: ['./lab-reports.component.scss']
})
export class LabReportsComponent implements OnInit, OnDestroy {
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;

	private destroy$ = new Subject<void>();

	currentUser: any;
	isDarkMode = false;
	isLoading = true;

	// Lab Reports Data
	labReports: LabReport[] = [];
	dataSource = new MatTableDataSource<LabReport>();
	displayedColumns: string[] = ['reportDate', 'reportType', 'status', 'priority', 'doctor', 'department', 'actions'];

	// Filter Options
	selectedStatus = 'All';
	selectedPriority = 'All';
	selectedDateRange: { start: Date | null; end: Date | null } = { start: null, end: null };

	statusOptions = ['All', 'Pending', 'Completed', 'Reviewed', 'Critical'];
	priorityOptions = ['All', 'Low', 'Medium', 'High', 'Critical'];

	// Statistics
	labStats = {
		totalReports: 0,
		pendingReports: 0,
		criticalReports: 0,
		completedThisMonth: 0
	};

	constructor(
		private labReportService: LabReportService,
		private authService: AuthService,
		private themeService: ThemeService,
		private dialog: MatDialog,
		private snackBar: MatSnackBar,
		private exportService: ExportService
	) { }

	ngOnInit(): void {
		this.initializeComponent();
		this.subscribeToTheme();
		this.loadLabReports();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private initializeComponent(): void {
		this.currentUser = this.authService.getCurrentUser();
	}

	private subscribeToTheme(): void {
		this.themeService.isDarkMode$
			.pipe(takeUntil(this.destroy$))
			.subscribe(isDark => {
				this.isDarkMode = isDark;
			});
	}

	private loadLabReports(): void {
		this.isLoading = true;

		if (this.currentUser) {
			this.labReportService.getLabReportsByPatientId(this.currentUser.id)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (reports: LabReport[]) => {
						this.labReports = reports;
						this.dataSource.data = reports;
						this.calculateStatistics();
						this.setupTableFeatures();
						this.isLoading = false;
					},
					error: (error: any) => {
						console.error('Error loading lab reports:', error);
						this.isLoading = false;
						this.showErrorMessage('Failed to load lab reports');
					}
				});
		}
	}

	private calculateStatistics(): void {
		const now = new Date();
		const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

		this.labStats = {
			totalReports: this.labReports.length,
			pendingReports: this.labReports.filter(r => r.status === 'Pending').length,
			criticalReports: this.labReports.filter(r => r.status === 'Critical' || r.priority === 'Critical').length,
			completedThisMonth: this.labReports.filter(r =>
				r.status === 'Completed' && new Date(r.reportDate) >= thisMonth
			).length
		};
	}

	private setupTableFeatures(): void {
		setTimeout(() => {
			if (this.paginator) {
				this.dataSource.paginator = this.paginator;
			}
			if (this.sort) {
				this.dataSource.sort = this.sort;
			}
		});
	}

	// Filter Methods
	applyFilters(): void {
		let filteredData = [...this.labReports];

		// Status filter
		if (this.selectedStatus !== 'All') {
			filteredData = filteredData.filter(report => report.status === this.selectedStatus);
		}

		// Priority filter
		if (this.selectedPriority !== 'All') {
			filteredData = filteredData.filter(report => report.priority === this.selectedPriority);
		}

		// Date range filter
		if (this.selectedDateRange.start) {
			filteredData = filteredData.filter(report =>
				new Date(report.reportDate) >= this.selectedDateRange.start!
			);
		}

		if (this.selectedDateRange.end) {
			filteredData = filteredData.filter(report =>
				new Date(report.reportDate) <= this.selectedDateRange.end!
			);
		}

		this.dataSource.data = filteredData;
	}

	clearFilters(): void {
		this.selectedStatus = 'All';
		this.selectedPriority = 'All';
		this.selectedDateRange = { start: null, end: null };
		this.dataSource.data = this.labReports;
	}

	applyQuickSearch(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();

		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}

	// Action Methods
	viewReport(report: LabReport): void {
		console.log('View report:', report);
		// Navigate to detailed report view
	}

	downloadReport(report: LabReport): void {
		console.log('Download report:', report);
		// Implement PDF download
	}

	shareReport(report: LabReport): void {
		console.log('Share report:', report);
		// Implement sharing functionality
	}

	exportReports(): void {
		const filename = `lab-reports-${new Date().toISOString().split('T')[0]}`;
		this.exportService.exportTimelineToCSV(
			this.dataSource.data.map(report => ({
				id: report.id.toString(),
				date: report.reportDate,
				title: report.reportType,
				description: `${report.reportType} - ${report.status}`,
				icon: 'science',
				color: this.getStatusColor(report.status),
				type: 'test' as const,
				priority: report.priority.toLowerCase() as 'high' | 'medium' | 'low',
				tags: [report.reportType, report.department, report.status],
				data: report
			})),
			filename
		);

		this.showSuccessMessage('Lab reports exported successfully');
	}

	// Utility Methods
	getStatusClass(status: string): string {
		switch (status.toLowerCase()) {
			case 'completed': return 'status-stable';
			case 'reviewed': return 'status-info';
			case 'pending': return 'status-warning';
			case 'critical': return 'status-critical';
			default: return 'status-info';
		}
	}

	getPriorityClass(priority: string): string {
		switch (priority.toLowerCase()) {
			case 'low': return 'priority-low';
			case 'medium': return 'priority-medium';
			case 'high': return 'priority-high';
			case 'critical': return 'priority-critical';
			default: return 'priority-medium';
		}
	}

	private getStatusColor(status: string): string {
		switch (status.toLowerCase()) {
			case 'completed': return '#4caf50';
			case 'reviewed': return '#2196f3';
			case 'pending': return '#ff9800';
			case 'critical': return '#f44336';
			default: return '#757575';
		}
	}

	formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	private showSuccessMessage(message: string): void {
		this.snackBar.open(message, 'Close', {
			duration: 3000,
			panelClass: ['success-snackbar'],
			horizontalPosition: 'end',
			verticalPosition: 'top'
		});
	}

	private showErrorMessage(message: string): void {
		this.snackBar.open(message, 'Close', {
			duration: 5000,
			panelClass: ['error-snackbar'],
			horizontalPosition: 'end',
			verticalPosition: 'top'
		});
	}
}
