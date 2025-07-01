import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MedicalHistoryService } from '../../../core/services/medical-history.service';
import { AuthService } from '../../../core/services/auth.service';
import { MedicalHistoryDto } from '../../../core/models/medical-history.model';

@Component({
	selector: 'app-medical-history-list',
	standalone: false,
	templateUrl: './medical-history-list.component.html',
	styleUrls: ['./medical-history-list.component.scss']
})
export class MedicalHistoryListComponent implements OnInit {
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;

	dataSource = new MatTableDataSource<MedicalHistoryDto>();
	displayedColumns: string[] = ['personalHistory', 'allergies', 'chronicConditions', 'medications', 'actions'];
	isLoading = true;
	currentUser: any = null;

	constructor(
		private medicalHistoryService: MedicalHistoryService,
		private authService: AuthService,
		private router: Router
	) { }

	ngOnInit(): void {
		this.currentUser = this.authService.getCurrentUser();
		this.loadMedicalHistory();
	}

	private loadMedicalHistory(): void {
		if (!this.currentUser) return;

		this.isLoading = true;
		this.medicalHistoryService.getMedicalHistoryByUserId(this.currentUser.id)
			.subscribe({
				next: (data) => {
					this.dataSource.data = data;
					this.dataSource.paginator = this.paginator;
					this.dataSource.sort = this.sort;
					this.isLoading = false;
				},
				error: (error) => {
					console.error('Error loading medical history:', error);
					this.isLoading = false;
				}
			});
	}

	public getChronicConditions(history: MedicalHistoryDto): string[] {
		const conditions: string[] = [];
		if (history.hasAsthma) conditions.push('Asthma');
		if (history.hasBloodPressure) conditions.push('Hypertension');
		if (history.hasCholesterol) conditions.push('High Cholesterol');
		if (history.hasDiabetes) conditions.push('Diabetes');
		if (history.hasHeartDisease) conditions.push('Heart Disease');
		return conditions;
	}

	public editMedicalHistory(id: number): void {
		this.router.navigate(['/medical-history/edit', id]);
	}

	public createMedicalHistory(): void {
		this.router.navigate(['/medical-history/create']);
	}

	public applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();
	}
}
