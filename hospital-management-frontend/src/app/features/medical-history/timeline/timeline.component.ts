import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MedicalHistoryService, MedicalHistory } from '../../../core/services/medical-history.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

interface TimelineEvent {
	date: Date;
	title: string;
	description: string;
	icon: string;
	color: string;
	type: 'medical' | 'appointment' | 'medication' | 'test';
	data?: any;
}

@Component({
	selector: 'app-timeline',
	standalone:false,
	templateUrl: './timeline.component.html',
	styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();

	currentUser: any;
	isDarkMode = false;
	isLoading = true;

	timelineEvents: TimelineEvent[] = [];

	constructor(
		private medicalHistoryService: MedicalHistoryService,
		private authService: AuthService,
		private themeService: ThemeService
	) { }

	ngOnInit(): void {
		this.initializeComponent();
		this.subscribeToTheme();
		this.loadMedicalHistory();
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

	private loadMedicalHistory(): void {
		this.isLoading = true;

		if (this.currentUser) {
			this.medicalHistoryService.getMedicalHistoriesByUserId(this.currentUser.id)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (histories: MedicalHistory[]) => {
						this.processTimelineEvents(histories);
						this.isLoading = false;
					},
					error: (error: any) => {
						console.error('Error loading medical history:', error);
						this.loadMockData();
						this.isLoading = false;
					}
				});
		} else {
			this.loadMockData();
			this.isLoading = false;
		}
	}

	private processTimelineEvents(histories: MedicalHistory[]): void {
		this.timelineEvents = histories.map(history => ({
			date: history.createdAt || new Date(),
			title: 'Medical History Record',
			description: history.personalHistory || 'Medical record updated',
			icon: 'pi pi-heart',
			color: this.getEventColor('medical'),
			type: 'medical',
			data: history
		}));

		// Sort by date (newest first)
		this.timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	}

	private loadMockData(): void {
		this.timelineEvents = [
			{
				date: new Date('2024-12-15'),
				title: 'Annual Physical Examination',
				description: 'Complete physical examination with blood work and vital signs check.',
				icon: 'pi pi-heart',
				color: '#4299ed',
				type: 'medical'
			},
			{
				date: new Date('2024-12-10'),
				title: 'Blood Test Results',
				description: 'Cholesterol and glucose levels within normal range.',
				icon: 'pi pi-chart-line',
				color: '#4caf50',
				type: 'test'
			},
			{
				date: new Date('2024-12-05'),
				title: 'Medication Update',
				description: 'Prescribed new medication for blood pressure management.',
				icon: 'pi pi-shopping-bag',
				color: '#ff9800',
				type: 'medication'
			},
			{
				date: new Date('2024-11-28'),
				title: 'Follow-up Appointment',
				description: 'Routine follow-up for ongoing treatment monitoring.',
				icon: 'pi pi-calendar',
				color: '#9c27b0',
				type: 'appointment'
			}
		];
	}

	private getEventColor(type: string): string {
		switch (type) {
			case 'medical': return '#4299ed';
			case 'appointment': return '#9c27b0';
			case 'medication': return '#ff9800';
			case 'test': return '#4caf50';
			default: return '#757575';
		}
	}

	getEventTypeClass(type: string): string {
		return `timeline-event-${type}`;
	}

	formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	viewEventDetails(event: TimelineEvent): void {
		console.log('View event details:', event);
		// Implement navigation to detailed view
	}
}
