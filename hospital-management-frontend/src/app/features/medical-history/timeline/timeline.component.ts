import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MedicalHistoryService, MedicalHistory } from '../../../core/services/medical-history.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { Chart, ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ExportService } from '../../../core/services/export.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventDetailsDialogComponent } from '../event-details-dialog/event-details-dialog.component';
import { EventEditDialogComponent } from '../event-edit-dialog/event-edit-dialog.component';
import { ExportOptionsDialogComponent } from '../export-options-dialog/export-options-dialog.component';

interface TimelineEvent {
	id: string;
	date: Date;
	title: string;
	description: string;
	icon: string;
	color: string;
	type: 'medical' | 'appointment' | 'medication' | 'test' | 'surgery' | 'emergency';
	priority: 'high' | 'medium' | 'low';
	data?: any;
	tags: string[];
}

interface FilterOptions {
	dateRange: { start: Date | null; end: Date | null };
	eventTypes: string[];
	priorities: string[];
	searchTerm: string;
}

@Component({
	selector: 'app-timeline',
	standalone: false,
	templateUrl: './timeline.component.html',
	styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();

	currentUser: any;
	isDarkMode = false;
	isLoading = true;

	// Timeline Data
	allTimelineEvents: TimelineEvent[] = [];
	filteredTimelineEvents: TimelineEvent[] = [];

	// Search and Filter Controls
	searchControl = new FormControl('');
	filterOptions: FilterOptions = {
		dateRange: { start: null, end: null },
		eventTypes: [],
		priorities: [],
		searchTerm: ''
	};

	// Filter Options
	availableEventTypes = [
		{ value: 'medical', label: 'Medical Records', icon: 'medical_services', color: '#4299ed' },
		{ value: 'appointment', label: 'Appointments', icon: 'event', color: '#9c27b0' },
		{ value: 'medication', label: 'Medications', icon: 'medication', color: '#ff9800' },
		{ value: 'test', label: 'Lab Tests', icon: 'science', color: '#4caf50' },
		{ value: 'surgery', label: 'Surgeries', icon: 'healing', color: '#f44336' },
		{ value: 'emergency', label: 'Emergency', icon: 'emergency', color: '#e91e63' }
	];

	availablePriorities = [
		{ value: 'high', label: 'High Priority', color: '#f44336' },
		{ value: 'medium', label: 'Medium Priority', color: '#ff9800' },
		{ value: 'low', label: 'Low Priority', color: '#4caf50' }
	];

	// Statistics
	timelineStats = {
		totalEvents: 0,
		thisMonth: 0,
		criticalEvents: 0,
		upcomingAppointments: 0
	};

	// Chart Configuration for Health Trends
	public healthTrendsChartType: ChartType = 'line';
	public healthTrendsChartData: ChartData<'line'> = {
		labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
		datasets: [
			{
				label: 'Blood Pressure (Systolic)',
				data: [120, 118, 122, 119, 121, 120],
				borderColor: '#4299ed',
				backgroundColor: 'rgba(66, 153, 237, 0.1)',
				tension: 0.4,
				fill: true
			},
			{
				label: 'Heart Rate',
				data: [72, 75, 70, 73, 71, 72],
				borderColor: '#4caf50',
				backgroundColor: 'rgba(76, 175, 80, 0.1)',
				tension: 0.4,
				fill: true
			}
		]
	};

	public chartOptions: ChartConfiguration['options'] = {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			y: {
				beginAtZero: false,
				grid: { color: 'rgba(0,0,0,0.1)' }
			},
			x: {
				grid: { color: 'rgba(0,0,0,0.1)' }
			}
		},
		plugins: {
			legend: { position: 'top' }
		}
	};

	constructor(
		private medicalHistoryService: MedicalHistoryService,
		private authService: AuthService,
		private themeService: ThemeService,
		private dialog: MatDialog,
		private snackBar: MatSnackBar,
		private exportService: ExportService
	) { }

	ngOnInit(): void {
		this.initializeComponent();
		this.subscribeToTheme();
		this.setupSearchSubscription();
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
				this.updateChartTheme();
			});
	}

	private setupSearchSubscription(): void {
		this.searchControl.valueChanges
			.pipe(
				debounceTime(300),
				distinctUntilChanged(),
				takeUntil(this.destroy$)
			)
			.subscribe(searchTerm => {
				this.filterOptions.searchTerm = searchTerm || '';
				this.applyFilters();
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
						this.loadMockAdditionalData(); // Add mock data for demonstration
						this.calculateStatistics();
						this.applyFilters();
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
		this.allTimelineEvents = histories.map((history, index) => ({
			id: `medical-${history.id || index}`,
			date: history.createdAt || new Date(),
			title: 'Medical History Record',
			description: history.personalHistory || 'Medical record updated',
			icon: 'medical_services',
			color: this.getEventColor('medical'),
			type: 'medical',
			priority: this.determinePriority(history),
			data: history,
			tags: this.generateTags(history)
		}));
	}

	private loadMockAdditionalData(): void {
		const mockEvents: TimelineEvent[] = [
			{
				id: 'appointment-1',
				date: new Date('2024-12-20'),
				title: 'Cardiology Consultation',
				description: 'Follow-up appointment with Dr. Sarah Johnson for heart health assessment.',
				icon: 'event',
				color: '#9c27b0',
				type: 'appointment',
				priority: 'high',
				tags: ['cardiology', 'follow-up', 'heart'],
				data: { doctor: 'Dr. Sarah Johnson', department: 'Cardiology' }
			},
			{
				id: 'test-1',
				date: new Date('2024-12-18'),
				title: 'Blood Test Results',
				description: 'Complete blood count and lipid panel results available.',
				icon: 'science',
				color: '#4caf50',
				type: 'test',
				priority: 'medium',
				tags: ['blood-test', 'lipid-panel', 'results'],
				data: { testType: 'Blood Work', status: 'Normal' }
			},
			{
				id: 'medication-1',
				date: new Date('2024-12-15'),
				title: 'Medication Update',
				description: 'Started new medication for blood pressure management.',
				icon: 'medication',
				color: '#ff9800',
				type: 'medication',
				priority: 'high',
				tags: ['medication', 'blood-pressure', 'new'],
				data: { medication: 'Lisinopril 10mg', dosage: 'Once daily' }
			},
			{
				id: 'surgery-1',
				date: new Date('2024-11-28'),
				title: 'Minor Surgical Procedure',
				description: 'Successful removal of skin lesion under local anesthesia.',
				icon: 'healing',
				color: '#f44336',
				type: 'surgery',
				priority: 'high',
				tags: ['surgery', 'dermatology', 'outpatient'],
				data: { procedure: 'Lesion Removal', outcome: 'Successful' }
			},
			{
				id: 'emergency-1',
				date: new Date('2024-11-15'),
				title: 'Emergency Room Visit',
				description: 'Treated for acute chest pain, discharged after observation.',
				icon: 'emergency',
				color: '#e91e63',
				type: 'emergency',
				priority: 'high',
				tags: ['emergency', 'chest-pain', 'observation'],
				data: { diagnosis: 'Non-cardiac chest pain', duration: '6 hours' }
			}
		];

		this.allTimelineEvents = [...this.allTimelineEvents, ...mockEvents];
		this.allTimelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	}

	private loadMockData(): void {
		this.allTimelineEvents = [
			{
				id: 'mock-1',
				date: new Date('2024-12-15'),
				title: 'Annual Physical Examination',
				description: 'Complete physical examination with blood work and vital signs check.',
				icon: 'medical_services',
				color: '#4299ed',
				type: 'medical',
				priority: 'medium',
				tags: ['annual', 'physical', 'checkup'],
				data: null
			}
		];
	}

	private determinePriority(history: MedicalHistory): 'high' | 'medium' | 'low' {
		if (history.hasHeartDisease || history.hasDiabetes) return 'high';
		if (history.hasBloodPressure || history.hasAsthma) return 'medium';
		return 'low';
	}

	private generateTags(history: MedicalHistory): string[] {
		const tags: string[] = [];
		if (history.hasAsthma) tags.push('asthma');
		if (history.hasDiabetes) tags.push('diabetes');
		if (history.hasBloodPressure) tags.push('hypertension');
		if (history.hasHeartDisease) tags.push('heart-disease');
		if (history.hasCholesterol) tags.push('cholesterol');
		return tags;
	}

	private getEventColor(type: string): string {
		const typeConfig = this.availableEventTypes.find(t => t.value === type);
		return typeConfig?.color || '#757575';
	}

	private calculateStatistics(): void {
		const now = new Date();
		const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

		this.timelineStats = {
			totalEvents: this.allTimelineEvents.length,
			thisMonth: this.allTimelineEvents.filter(event =>
				new Date(event.date) >= thisMonth
			).length,
			criticalEvents: this.allTimelineEvents.filter(event =>
				event.priority === 'high'
			).length,
			upcomingAppointments: this.allTimelineEvents.filter(event =>
				event.type === 'appointment' && new Date(event.date) > now
			).length
		};
	}

	private updateChartTheme(): void {
		if (this.chartOptions && this.chartOptions.scales) {
			const gridColor = this.isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
			this.chartOptions.scales['y']!.grid!.color = gridColor;
			this.chartOptions.scales['x']!.grid!.color = gridColor;
		}
	}

	// Filter and Search Methods
	applyFilters(): void {
		let filtered = [...this.allTimelineEvents];

		// Apply search filter
		if (this.filterOptions.searchTerm) {
			const searchTerm = this.filterOptions.searchTerm.toLowerCase();
			filtered = filtered.filter(event =>
				event.title.toLowerCase().includes(searchTerm) ||
				event.description.toLowerCase().includes(searchTerm) ||
				event.tags.some(tag => tag.toLowerCase().includes(searchTerm))
			);
		}

		// Apply event type filter
		if (this.filterOptions.eventTypes.length > 0) {
			filtered = filtered.filter(event =>
				this.filterOptions.eventTypes.includes(event.type)
			);
		}

		// Apply priority filter
		if (this.filterOptions.priorities.length > 0) {
			filtered = filtered.filter(event =>
				this.filterOptions.priorities.includes(event.priority)
			);
		}

		// Apply date range filter
		if (this.filterOptions.dateRange.start) {
			filtered = filtered.filter(event =>
				new Date(event.date) >= this.filterOptions.dateRange.start!
			);
		}

		if (this.filterOptions.dateRange.end) {
			filtered = filtered.filter(event =>
				new Date(event.date) <= this.filterOptions.dateRange.end!
			);
		}

		this.filteredTimelineEvents = filtered;
	}

	toggleEventTypeFilter(eventType: string): void {
		const index = this.filterOptions.eventTypes.indexOf(eventType);
		if (index > -1) {
			this.filterOptions.eventTypes.splice(index, 1);
		} else {
			this.filterOptions.eventTypes.push(eventType);
		}
		this.applyFilters();
	}

	togglePriorityFilter(priority: string): void {
		const index = this.filterOptions.priorities.indexOf(priority);
		if (index > -1) {
			this.filterOptions.priorities.splice(index, 1);
		} else {
			this.filterOptions.priorities.push(priority);
		}
		this.applyFilters();
	}

	clearAllFilters(): void {
		this.filterOptions = {
			dateRange: { start: null, end: null },
			eventTypes: [],
			priorities: [],
			searchTerm: ''
		};
		this.searchControl.setValue('');
		this.applyFilters();
	}

	// Event Methods
	formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	getEventTypeClass(type: string): string {
		return `timeline-event-${type}`;
	}

	getPriorityClass(priority: string): string {
		return `priority-${priority}`;
	}

	// Update these methods
	viewEventDetails(event: TimelineEvent): void {
		const dialogRef = this.dialog.open(EventDetailsDialogComponent, {
			width: '800px',
			maxWidth: '90vw',
			data: event,
			panelClass: 'event-details-dialog-panel'
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result === 'edit') {
				this.editEvent(event);
			}
		});
	}

	editEvent(event: TimelineEvent): void {
		const dialogRef = this.dialog.open(EventEditDialogComponent, {
			width: '600px',
			maxWidth: '90vw',
			data: event,
			panelClass: 'event-edit-dialog-panel'
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				// Update the event in the timeline
				const index = this.allTimelineEvents.findIndex(e => e.id === event.id);
				if (index > -1) {
					this.allTimelineEvents[index] = result;
					this.applyFilters();

					this.snackBar.open('Event updated successfully', 'Close', {
						duration: 3000,
						panelClass: ['success-snackbar'],
						horizontalPosition: 'end',
						verticalPosition: 'top'
					});
				}
			}
		});
	}

	exportTimeline(): void {
		const dialogRef = this.dialog.open(ExportOptionsDialogComponent, {
			width: '400px',
			data: {
				totalEvents: this.filteredTimelineEvents.length,
				patientName: `${this.currentUser?.firstName} ${this.currentUser?.lastName}`
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				const patientName = `${this.currentUser?.firstName || 'Patient'} ${this.currentUser?.lastName || ''}`.trim();
				const filename = `medical-timeline-${new Date().toISOString().split('T')[0]}`;

				switch (result.format) {
					case 'csv':
						this.exportService.exportTimelineToCSV(this.filteredTimelineEvents, filename);
						break;
					case 'pdf':
						this.exportService.exportTimelineToPDF(this.filteredTimelineEvents, patientName);
						break;
					case 'json':
						this.exportService.exportTimelineToJSON(this.filteredTimelineEvents, filename);
						break;
				}

				this.snackBar.open(`Timeline exported as ${result.format.toUpperCase()}`, 'Close', {
					duration: 3000,
					panelClass: ['success-snackbar'],
					horizontalPosition: 'end',
					verticalPosition: 'top'
				});
			}
		});
	}
}