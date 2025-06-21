import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LabReportService } from '../../core/services/lab-report.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ExportService } from '../../core/services/export.service';
import { LabReportDto } from '../../core/models/lab-report.model';
import { Router } from '@angular/router';

@Component({
	selector: 'app-lab-reports',
	standalone: false,
	templateUrl: './lab-reports.component.html',
	styleUrls: ['./lab-reports.component.scss']
})

export class LabReportsComponent implements OnInit {
	labReports: LabReportDto[] = [];
	filteredReports: LabReportDto[] = [];
	loading = false;
	currentUser: any;

	// Filter properties
	selectedStatus = '';
	selectedPriority = '';
	selectedDateRange = '';
	searchTerm = '';

	// Filter options
	statusOptions = ['All', 'Critical', 'Warning', 'Normal'];
	priorityOptions = ['All', 'High', 'Medium', 'Low'];
	dateRangeOptions = ['All', 'Last 7 days', 'Last 30 days', 'Last 90 days'];

	constructor(
		private labReportService: LabReportService,
		private authService: AuthService,
		private router: Router
	) { }

	ngOnInit(): void {
		this.currentUser = this.authService.getCurrentUser();
		this.loadLabReports();
	}

	private loadLabReports(): void {
		if (this.currentUser?.id) {
			this.loading = true;
			this.labReportService.getLabReportsByPatientId(this.currentUser.id)
				.subscribe({
					next: (reports: LabReportDto[]) => {
						this.labReports = reports.sort((a: LabReportDto, b: LabReportDto) =>
							new Date(b.testedDate).getTime() - new Date(a.testedDate).getTime());
						this.filteredReports = [...this.labReports];
						this.loading = false;
					},
					error: (error: any) => {
						console.error('Error loading lab reports:', error);
						this.loading = false;
					}
				});
		}
	}

	// FIXED: Add computed methods for missing properties
	public getStatus(report: LabReportDto): string {
		if (this.isCritical(report)) return 'Critical';
		if (this.isWarning(report)) return 'Warning';
		return 'Normal';
	}

	public getPriority(report: LabReportDto): string {
		if (this.isCritical(report)) return 'High';
		if (this.isWarning(report)) return 'Medium';
		return 'Low';
	}

	public getReportDate(report: LabReportDto): string {
		return report.testedDate.toString();
	}

	public getReportType(report: LabReportDto): string {
		return report.testPerformed;
	}

	public getDepartment(report: LabReportDto): string {
		// Determine department based on test type
		const testType = report.testPerformed.toLowerCase();
		if (testType.includes('blood') || testType.includes('cholesterol') || testType.includes('glucose')) {
			return 'Hematology';
		}
		if (testType.includes('urine')) {
			return 'Urology';
		}
		if (testType.includes('x-ray') || testType.includes('scan') || testType.includes('mri')) {
			return 'Radiology';
		}
		if (testType.includes('ecg') || testType.includes('heart')) {
			return 'Cardiology';
		}
		return 'General Lab';
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

	private isWarning(report: LabReportDto): boolean {
		return (
			(report.cholesterolLevel > 200 && report.cholesterolLevel <= 240) ||
			(report.sucroseLevel > 140 && report.sucroseLevel <= 200) ||
			(report.heartBeatRatio > 90 && report.heartBeatRatio <= 100) ||
			(report.heartBeatRatio >= 60 && report.heartBeatRatio < 70)
		);
	}

	public applyFilters(): void {
		this.filteredReports = this.labReports.filter(report => {
			// FIXED: Use computed status instead of non-existent property
			const reportStatus = this.getStatus(report);
			const reportPriority = this.getPriority(report);
			const reportDate = new Date(this.getReportDate(report));

			// Status filter
			if (this.selectedStatus && this.selectedStatus !== 'All' && reportStatus !== this.selectedStatus) {
				return false;
			}

			// Priority filter
			if (this.selectedPriority && this.selectedPriority !== 'All' && reportPriority !== this.selectedPriority) {
				return false;
			}

			// Date range filter
			if (this.selectedDateRange && this.selectedDateRange !== 'All') {
				const now = new Date();
				let daysBack = 0;

				switch (this.selectedDateRange) {
					case 'Last 7 days':
						daysBack = 7;
						break;
					case 'Last 30 days':
						daysBack = 30;
						break;
					case 'Last 90 days':
						daysBack = 90;
						break;
				}

				if (daysBack > 0) {
					const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
					if (reportDate < cutoffDate) {
						return false;
					}
				}
			}

			// Search term filter
			if (this.searchTerm) {
				const searchLower = this.searchTerm.toLowerCase();
				const reportType = this.getReportType(report).toLowerCase();
				const department = this.getDepartment(report).toLowerCase();

				if (!reportType.includes(searchLower) && !department.includes(searchLower)) {
					return false;
				}
			}

			return true;
		});
	}

	public clearFilters(): void {
		this.selectedStatus = '';
		this.selectedPriority = '';
		this.selectedDateRange = '';
		this.searchTerm = '';
		this.filteredReports = [...this.labReports];
	}

	public getStatusClass(report: LabReportDto): string {
		const status = this.getStatus(report);
		switch (status) {
			case 'Critical': return 'status-critical';
			case 'Warning': return 'status-warning';
			default: return 'status-stable';
		}
	}

	public getPriorityClass(report: LabReportDto): string {
		const priority = this.getPriority(report);
		switch (priority) {
			case 'High': return 'priority-high';
			case 'Medium': return 'priority-medium';
			default: return 'priority-low';
		}
	}

	public formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString();
	}

	public viewReport(report: LabReportDto): void {
		this.router.navigate(['/lab-reports', report.id]);
	}

	public editReport(report: LabReportDto): void {
		this.router.navigate(['/lab-reports', 'edit', report.id]);
	}

	public deleteReport(report: LabReportDto): void {
		if (confirm('Are you sure you want to delete this lab report?')) {
			this.labReportService.deleteLabReport(report.id).subscribe({
				next: () => {
					this.labReports = this.labReports.filter(r => r.id !== report.id);
					this.applyFilters();
				},
				error: (error: any) => {
					console.error('Error deleting lab report:', error);
				}
			});
		}
	}

	public exportReport(report: LabReportDto): void {
		// FIXED: Use computed values for export
		const exportData = {
			id: report.id,
			patientId: report.patientId,
			testType: this.getReportType(report),
			department: this.getDepartment(report),
			testedBy: report.testedBy,
			testDate: this.formatDate(this.getReportDate(report)),
			status: this.getStatus(report),
			priority: this.getPriority(report),
			cholesterolLevel: report.cholesterolLevel,
			sucroseLevel: report.sucroseLevel,
			whiteBloodCellsRatio: report.whiteBloodCellsRatio,
			redBloodCellsRatio: report.redBloodCellsRatio,
			heartBeatRatio: report.heartBeatRatio,
			phLevel: report.phLevel,
			reports: report.reports
		};

		// Convert to CSV or JSON for download
		const dataStr = JSON.stringify(exportData, null, 2);
		const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

		const exportFileDefaultName = `lab-report-${report.id}.json`;

		const linkElement = document.createElement('a');
		linkElement.setAttribute('href', dataUri);
		linkElement.setAttribute('download', exportFileDefaultName);
		linkElement.click();
	}

	public navigateToComparison(): void {
		this.router.navigate(['/lab-reports/comparison']);
	}

	public navigateToCriticalAlerts(): void {
		this.router.navigate(['/lab-reports/critical-alerts']);
	}

	public createNewReport(): void {
		this.router.navigate(['/lab-reports/create']);
	}
}
