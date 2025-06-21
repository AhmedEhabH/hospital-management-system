import { Component, OnInit } from '@angular/core';
import { LabReportService } from '../../../core/services/lab-report.service';
import { LabReportDto } from '../../../core/models/lab-report.model';
import { AuthService } from '../../../core/services/auth.service';


@Component({
	selector: 'app-lab-comparison',
	standalone: false,
	templateUrl: './lab-comparison.component.html',
	styleUrls: ['./lab-comparison.component.scss']
})
export class LabComparisonComponent implements OnInit {
	labReports: LabReportDto[] = [];
	selectedReports: LabReportDto[] = [];
	loading = false;
	comparisonData: any[] = [];
	currentUser: any;

	constructor(
		private labReportService: LabReportService,
		private authService: AuthService
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
						this.loading = false;
					},
					error: (error: any) => {
						console.error('Error loading lab reports:', error);
						this.loading = false;
					}
				});
		}
	}

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

	public selectReport(report: LabReportDto): void {
		if (this.selectedReports.includes(report)) {
			this.selectedReports = this.selectedReports.filter(r => r.id !== report.id);
		} else if (this.selectedReports.length < 3) {
			this.selectedReports.push(report);
		}
		this.generateComparison();
	}

	public isSelected(report: LabReportDto): boolean {
		return this.selectedReports.some(r => r.id === report.id);
	}

	public clearSelection(): void {
		this.selectedReports = [];
		this.comparisonData = [];
	}

	private generateComparison(): void {
		if (this.selectedReports.length < 2) {
			this.comparisonData = [];
			return;
		}

		const metrics = [
			{ name: 'Cholesterol Level', key: 'cholesterolLevel', unit: 'mg/dL' },
			{ name: 'Sucrose Level', key: 'sucroseLevel', unit: 'mg/dL' },
			{ name: 'White Blood Cells', key: 'whiteBloodCellsRatio', unit: 'cells/μL' },
			{ name: 'Red Blood Cells', key: 'redBloodCellsRatio', unit: 'cells/μL' },
			{ name: 'Heart Beat Ratio', key: 'heartBeatRatio', unit: 'bpm' },
			{ name: 'pH Level', key: 'phLevel', unit: 'pH' }
		];

		this.comparisonData = metrics.map(metric => {
			const values = this.selectedReports.map(report => ({
				reportId: report.id,
				testDate: report.testedDate,
				testType: report.testPerformed,
				value: (report as any)[metric.key] || 0
			}));

			return {
				metric: metric.name,
				unit: metric.unit,
				values: values
			};
		});
	}

	public formatReportTitle(report: LabReportDto): string {
		return `${report.testPerformed} - ${this.formatDate(report.testedDate.toString())}`;
	}

	// FIXED: Use string parameter for formatDate
	public formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString();
	}

	// FIXED: Remove duplicate getStatusClass method - keep only one
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

	public getDisplayedColumns(): string[] {
		const columns = ['metric'];
		for (let i = 0; i < this.selectedReports.length; i++) {
			columns.push(`report${i}`);
		}
		return columns;
	}
}