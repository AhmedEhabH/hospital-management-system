import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { LabReportService } from '../../../core/services/lab-report.service';
import { AuthService } from '../../../core/services/auth.service';
import { LabReportDto } from '../../../core/models/lab-report.model';

@Component({
	selector: 'app-lab-reports-list',
	standalone: false,
	templateUrl: './lab-reports-list.component.html',
	styleUrls: ['./lab-reports-list.component.scss']
})
export class LabReportsListComponent implements OnInit {
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;

	dataSource = new MatTableDataSource<LabReportDto>();
	displayedColumns: string[] = ['testPerformed', 'testedBy', 'testedDate', 'status', 'actions'];
	isLoading = true;
	currentUser: any = null;

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
		if (!this.currentUser) return;

		this.isLoading = true;
		this.labReportService.getLabReportsByPatientId(this.currentUser.id)
			.subscribe({
				next: (data) => {
					this.dataSource.data = data;
					this.dataSource.paginator = this.paginator;
					this.dataSource.sort = this.sort;
					this.isLoading = false;
				},
				error: (error) => {
					console.error('Error loading lab reports:', error);
					this.isLoading = false;
				}
			});
	}

	public getLabStatus(report: LabReportDto): { status: string; class: string } {
		if (report.cholesterolLevel > 240 || report.phLevel < 7.0 || report.phLevel > 7.8) {
			return { status: 'Critical', class: 'status-critical' };
		}
		return { status: 'Normal', class: 'status-stable' };
	}

	public viewLabReport(id: number): void {
		this.router.navigate(['/lab-reports/view', id]);
	}

	public createLabReport(): void {
		this.router.navigate(['/lab-reports/create']);
	}

	public applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();
	}
}
