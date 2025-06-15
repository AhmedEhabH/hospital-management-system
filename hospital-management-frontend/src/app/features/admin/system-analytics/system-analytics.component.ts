import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ThemeService } from '../../../core/services/theme.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
	selector: 'app-system-analytics',
	standalone: false,
	templateUrl: './system-analytics.component.html',
	styleUrls: ['./system-analytics.component.scss']
})
export class SystemAnalyticsComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();

	isDarkMode = false;
	isLoading = true;

	// Analytics Data
	systemPerformance = {
		cpuUsage: 65,
		memoryUsage: 72,
		diskUsage: 45,
		networkTraffic: 88
	};

	// User Analytics Chart
	public userAnalyticsChartType: ChartType = 'bar';
	public userAnalyticsChartData: ChartData<'bar'> = {
		labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
		datasets: [
			{
				label: 'New Registrations',
				data: [12, 19, 15, 25, 22, 30],
				backgroundColor: '#4299ed',
				borderColor: '#2b76e5',
				borderWidth: 1
			},
			{
				label: 'Active Users',
				data: [8, 15, 12, 20, 18, 25],
				backgroundColor: '#4caf50',
				borderColor: '#388e3c',
				borderWidth: 1
			}
		]
	};

	// System Load Chart
	public systemLoadChartType: ChartType = 'line';
	public systemLoadChartData: ChartData<'line'> = {
		labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
		datasets: [
			{
				label: 'CPU Usage (%)',
				data: [45, 52, 68, 75, 65, 58],
				borderColor: '#ff9800',
				backgroundColor: 'rgba(255, 152, 0, 0.1)',
				tension: 0.4,
				fill: true
			},
			{
				label: 'Memory Usage (%)',
				data: [60, 65, 70, 78, 72, 68],
				borderColor: '#f44336',
				backgroundColor: 'rgba(244, 67, 54, 0.1)',
				tension: 0.4,
				fill: true
			}
		]
	};

	public chartOptions: ChartConfiguration['options'] = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: 'top',
			}
		}
	};

	constructor(private themeService: ThemeService) { }

	ngOnInit(): void {
		this.subscribeToTheme();
		this.loadAnalytics();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private subscribeToTheme(): void {
		this.themeService.isDarkMode$
			.pipe(takeUntil(this.destroy$))
			.subscribe(isDark => {
				this.isDarkMode = isDark;
				this.updateChartTheme();
			});
	}

	private loadAnalytics(): void {
		this.isLoading = true;

		// Simulate loading analytics data
		setTimeout(() => {
			this.isLoading = false;
		}, 1500);
	}

	private updateChartTheme(): void {
		if (this.chartOptions && this.chartOptions.plugins) {
			const textColor = this.isDarkMode ? '#ffffff' : '#212121';
			this.chartOptions.plugins.legend = {
				...this.chartOptions.plugins.legend,
				labels: {
					color: textColor
				}
			};
		}
	}

	getPerformanceClass(value: number): string {
		if (value < 50) return 'performance-good';
		if (value < 80) return 'performance-warning';
		return 'performance-critical';
	}

	refreshAnalytics(): void {
		this.loadAnalytics();
	}

	exportReport(): void {
		console.log('Export analytics report');
	}
}
