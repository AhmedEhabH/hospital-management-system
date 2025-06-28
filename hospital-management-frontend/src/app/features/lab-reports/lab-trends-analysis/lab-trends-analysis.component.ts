import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { LabReportService } from '../../../core/services/lab-report.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { LabReportDto } from '../../../core/models';

@Component({
	selector: 'app-lab-trends-analysis',
	standalone: false,
	templateUrl: './lab-trends-analysis.component.html',
	styleUrls: ['./lab-trends-analysis.component.scss']
})
export class LabTrendsAnalysisComponent implements OnInit, OnDestroy {
	@Input() patientId!: number;

	private destroy$ = new Subject<void>();

	isDarkMode = false;
	isLoading = true;

	// Trend Data
	trendsData: LabReportDto [] = [];
	selectedTests: string[] = ['Hemoglobin', 'Total Cholesterol', 'Glucose'];
	dateRange = {
		start: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000), // 6 months ago
		end: new Date()
	};

	// Available Tests for Selection
	availableTests = [
		'Hemoglobin', 'White Blood Cells', 'Platelets', 'Total Cholesterol',
		'LDL Cholesterol', 'HDL Cholesterol', 'Triglycerides', 'Glucose',
		'Creatinine', 'BUN', 'ALT', 'AST'
	];

	// Chart Configuration
	public trendsChartType: ChartType = 'line';
	public trendsChartData: ChartData<'line'> = {
		labels: [],
		datasets: []
	};

	public chartOptions: ChartConfiguration['options'] = {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			y: {
				beginAtZero: false,
				grid: { color: 'rgba(0,0,0,0.1)' },
				title: {
					display: true,
					text: 'Test Values'
				}
			},
			x: {
				grid: { color: 'rgba(0,0,0,0.1)' },
				title: {
					display: true,
					text: 'Date'
				}
			}
		},
		plugins: {
			legend: {
				position: 'top',
			},
			tooltip: {
				mode: 'index',
				intersect: false,
				callbacks: {
					title: (tooltipItems) => {
						return `Date: ${tooltipItems[0].label}`;
					},
					label: (context) => {
						const datasetLabel = context.dataset.label || '';
						const value = context.parsed.y;
						const status = this.getValueStatus(datasetLabel, value);
						return `${datasetLabel}: ${value} (${status})`;
					}
				}
			}
		},
		interaction: {
			mode: 'nearest',
			axis: 'x',
			intersect: false
		}
	};

	// Trend Statistics
	trendStats = {
		improvingTrends: 0,
		worseningTrends: 0,
		stableTrends: 0,
		criticalValues: 0
	};

	constructor(
		private labReportService: LabReportService,
		private themeService: ThemeService
	) { }

	ngOnInit(): void {
		this.subscribeToTheme();
		// this.loadTrendsData();
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

	/* private loadTrendsData(): void {
		this.isLoading = true;

		this.labReportService.getLabTrendsData(this.patientId, this.selectedTests, this.dateRange)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (data: LabTrendData[]) => {
					this.trendsData = data;
					this.updateChartData();
					this.calculateTrendStatistics();
					this.isLoading = false;
				},
				error: (error: any) => {
					console.error('Error loading trends data:', error);
					this.isLoading = false;
				}
			});
	} */

	/* private updateChartData(): void {
		if (this.trendsData.length === 0) return;

		// Get all unique dates
		const allDates = new Set<string>();
		this.trendsData.forEach(trend => {
			trend.data.forEach(point => {
				allDates.add(this.formatDateForChart(point.date));
			});
		});

		const sortedDates = Array.from(allDates).sort();

		// Create datasets for each test
		const datasets = this.trendsData.map((trend, index) => {
			const color = this.getTestColor(index);
			const data = sortedDates.map(date => {
				const point = trend.data.find(p => this.formatDateForChart(p.date) === date);
				return point ? point.value : null;
			});

			return {
				label: trend.testName,
				data: data,
				borderColor: color,
				backgroundColor: this.hexToRgba(color, 0.1),
				tension: 0.4,
				fill: false,
				pointBackgroundColor: data.map((value, i) => {
					if (value === null) return color;
					const point = trend.data.find(p => this.formatDateForChart(p.date) === sortedDates[i]);
					return this.getStatusColor(point?.status || 'Normal');
				}),
				pointBorderColor: color,
				pointRadius: 6,
				pointHoverRadius: 8
			};
		});

		this.trendsChartData = {
			labels: sortedDates,
			datasets: datasets
		};
	} */

	/* private calculateTrendStatistics(): void {
		let improving = 0;
		let worsening = 0;
		let stable = 0;
		let critical = 0;

		this.trendsData.forEach(trend => {
			if (trend.data.length < 2) return;

			const firstValue = trend.data[0].value;
			const lastValue = trend.data[trend.data.length - 1].value;
			const change = ((lastValue - firstValue) / firstValue) * 100;

			// Count critical values
			critical += trend.data.filter(point => point.status === 'Critical').length;

			// Determine trend direction (this is simplified - real logic would be test-specific)
			if (Math.abs(change) < 5) {
				stable++;
			} else if (this.isImprovingTrend(trend.testName, change)) {
				improving++;
			} else {
				worsening++;
			}
		});

		this.trendStats = {
			improvingTrends: improving,
			worseningTrends: worsening,
			stableTrends: stable,
			criticalValues: critical
		};
	} */

	private isImprovingTrend(testName: string, change: number): boolean {
		// For cholesterol, glucose, etc., lower is better
		const lowerIsBetter = ['Total Cholesterol', 'LDL Cholesterol', 'Glucose', 'Triglycerides'];
		// For HDL, hemoglobin, etc., higher is better
		const higherIsBetter = ['HDL Cholesterol', 'Hemoglobin'];

		if (lowerIsBetter.includes(testName)) {
			return change < 0; // Decreasing is improving
		} else if (higherIsBetter.includes(testName)) {
			return change > 0; // Increasing is improving
		}

		return Math.abs(change) < 5; // Stable is considered good for others
	}

	private getTestColor(index: number): string {
		const colors = [
			'#4299ed', '#4caf50', '#ff9800', '#f44336',
			'#9c27b0', '#009688', '#795548', '#607d8b'
		];
		return colors[index % colors.length];
	}

	private getStatusColor(status: string): string {
		switch (status.toLowerCase()) {
			case 'critical': return '#f44336';
			case 'high': return '#ff9800';
			case 'low': return '#ff9800';
			case 'abnormal': return '#ff9800';
			case 'normal': return '#4caf50';
			default: return '#4caf50';
		}
	}

	private getValueStatus(testName: string, value: number): string {
		// Simplified reference ranges - in real app, these would come from the backend
		const referenceRanges: { [key: string]: { low: number; high: number } } = {
			'Hemoglobin': { low: 12, high: 15.5 },
			'Total Cholesterol': { low: 0, high: 200 },
			'Glucose': { low: 70, high: 99 },
			'Creatinine': { low: 0.7, high: 1.3 }
		};

		const range = referenceRanges[testName];
		if (!range) return 'Normal';

		if (value < range.low) return 'Low';
		if (value > range.high) return 'High';
		return 'Normal';
	}

	private formatDateForChart(date: Date): string {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		});
	}

	private hexToRgba(hex: string, alpha: number): string {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	private updateChartTheme(): void {
		if (this.chartOptions && this.chartOptions.scales) {
			const gridColor = this.isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
			const textColor = this.isDarkMode ? '#ffffff' : '#212121';

			this.chartOptions.scales['y']!.grid!.color = gridColor;
			this.chartOptions.scales['x']!.grid!.color = gridColor;
		}
	}

	// Public Methods
	onTestSelectionChange(): void {
		// this.loadTrendsData();
	}

	onDateRangeChange(): void {
		// this.loadTrendsData();
	}

	exportTrends(): void {
		console.log('Export trends data');
		// Implement export functionality
	}

	getTrendClass(value: number): string {
		if (value > 0) return 'trend-improving';
		if (value < 0) return 'trend-worsening';
		return 'trend-stable';
	}
}
