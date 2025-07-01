import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';
import { UserInfoDto } from '../../../core/models/dtos';

@Component({
	selector: 'app-patient-management',
	standalone: false,
	templateUrl: './patient-management.component.html',
	styleUrls: ['./patient-management.component.scss']
})
export class PatientManagementComponent implements OnInit {
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;

	dataSource = new MatTableDataSource<UserInfoDto>();
	displayedColumns: string[] = ['name', 'email', 'userId', 'lastActivity', 'status', 'actions'];
	isLoading = true;

	constructor(
		private dashboardService: DashboardService,
		private router: Router
	) { }

	ngOnInit(): void {
		this.loadPatients();
	}

	private loadPatients(): void {
		this.isLoading = true;
		// Load patients from dashboard service or dedicated patient service
		this.dashboardService.getSystemStats()
			.subscribe({
				next: (stats) => {
					// For now, use mock data - implement actual patient loading
					this.dataSource.data = [];
					this.dataSource.paginator = this.paginator;
					this.dataSource.sort = this.sort;
					this.isLoading = false;
				},
				error: (error) => {
					console.error('Error loading patients:', error);
					this.isLoading = false;
				}
			});
	}

	public viewPatient(patientId: number): void {
		this.router.navigate(['/patients/view', patientId]);
	}

	public editPatient(patientId: number): void {
		this.router.navigate(['/patients/edit', patientId]);
	}

	public viewMedicalHistory(patientId: number): void {
		this.router.navigate(['/medical-history/patient', patientId]);
	}

	public viewLabReports(patientId: number): void {
		this.router.navigate(['/lab-reports/patient', patientId]);
	}

	public applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();
	}
}
