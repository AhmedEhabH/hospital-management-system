import { Component, OnInit, Input } from '@angular/core';
import { MedicalHistoryDto } from '../../../core/models/medical-history.model';
import { AuthService } from '../../../core/services/auth.service';
import { MedicalHistoryService } from '../../../core/services/medical-history.service';

@Component({
	selector: 'app-timeline',
	standalone: false,
	templateUrl: './timeline.component.html',
	styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit {
	@Input() medicalHistories: MedicalHistoryDto[] = [];
	currentUser: any = null;

	timelineItems: any[] = [];
	constructor(
		private authService: AuthService,
		private medicalHistoryService: MedicalHistoryService
	) { }
	ngOnInit(): void {
		this.currentUser = this.authService.getCurrentUser();
		this.buildTimeline();
		this.getMedicalHistory();
	}

	getMedicalHistory() {
		console.log(this.currentUser);
		
		this.medicalHistoryService.getMedicalHistoryByUserId(this.currentUser.id).subscribe({
			next: (value) => {
				console.log(value);
				this.medicalHistories = value;
			},
			error: err => {
				console.error(err);

			},
			complete:()=>{
				console.log("Complete");
				
			}
		})
	}

	private buildTimeline(): void {
		this.timelineItems = this.medicalHistories.map(history => ({
			id: history.id,
			title: this.getHistoryTitle(history),
			description: this.getHistoryDescription(history),
			date: history.createdAt ? new Date(history.createdAt) : new Date(),
			type: this.getHistoryType(history),
			icon: this.getHistoryIcon(history)
		})).sort((a, b) => b.date.getTime() - a.date.getTime());
	}

	// FIXED: Make methods public for template access
	public getHistoryTitle(history: MedicalHistoryDto): string {
		if (history.frequentlyOccurringDisease) {
			return `Condition: ${history.frequentlyOccurringDisease}`;
		}
		if (history.allergies) {
			return `Allergies: ${history.allergies}`;
		}
		return 'Medical History Update';
	}

	public getHistoryDescription(history: MedicalHistoryDto): string {
		const conditions = [];

		if (history.hasAsthma) conditions.push('Asthma');
		if (history.hasBloodPressure) conditions.push('High Blood Pressure');
		if (history.hasCholesterol) conditions.push('High Cholesterol');
		if (history.hasDiabetes) conditions.push('Diabetes');
		if (history.hasHeartDisease) conditions.push('Heart Disease');

		if (conditions.length > 0) {
			return `Conditions: ${conditions.join(', ')}`;
		}

		return history.personalHistory || 'Medical history entry';
	}

	public getHistoryIcon(history: MedicalHistoryDto): string {
		if (history.hasHeartDisease) return 'favorite';
		if (history.hasAsthma) return 'air';
		if (history.hasBloodPressure) return 'monitor_heart';
		if (history.hasDiabetes) return 'bloodtype';
		if (history.allergies) return 'warning';
		return 'medical_services';
	}

	// FIXED: Add missing getHistoryIconClass method
	public getHistoryIconClass(history: MedicalHistoryDto): string {
		if (history.hasHeartDisease || history.hasDiabetes) return 'critical-icon';
		if (history.hasBloodPressure || history.hasAsthma) return 'warning-icon';
		if (history.allergies) return 'alert-icon';
		return 'info-icon';
	}

	private getHistoryType(history: MedicalHistoryDto): string {
		if (history.hasAsthma || history.hasBloodPressure || history.hasDiabetes || history.hasHeartDisease) {
			return 'critical';
		}
		if (history.allergies) {
			return 'warning';
		}
		return 'info';
	}
}
