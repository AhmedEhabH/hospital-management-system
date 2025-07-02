import { Component, OnInit } from '@angular/core';
import { MedicalHistoryDto } from '../../core/models';
import { MedicalHistoryService } from '../../core/services/medical-history.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
	selector: 'app-medical-history',
	standalone: false,
	templateUrl: './medical-history.component.html',
	styleUrl: './medical-history.component.scss'
})
export class MedicalHistoryComponent implements OnInit {
	medicalHistories: MedicalHistoryDto[] = [];
	currentUser: any = null;
	constructor(
		private authService: AuthService,
		private medicalHistoryService: MedicalHistoryService
	) { }
	ngOnInit(): void {
		this.currentUser = this.authService.getCurrentUser();
		this.getMedicalHistory();
	}
	getMedicalHistory() {
		this.medicalHistoryService.getMedicalHistoryByUserId(this.currentUser.id).subscribe({
			next: (value) => {
				console.log(value);
				this.medicalHistories = value;
			},
			error: err => {
				console.error(err);

			}
		})
	}

}
