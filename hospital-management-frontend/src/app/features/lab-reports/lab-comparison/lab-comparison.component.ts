import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { LabReport } from '../../../core/services/lab-report.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

interface ComparisonData {
	testName: string;
	reports: {
		report: LabReport;
		value: number;
		status: string;
		change?: number;
		changePercent?: number;
	}[];
}

@Component({
	selector: 'app-lab-comparison',
	standalone: false,
	templateUrl: './lab-comparison.component.html',
	styleUrls: ['./lab-comparison.component.scss']
})
export class LabComparisonComponent implements OnInit, OnDestroy {
	@Input() labReports: LabReport[] = [];

	private destroy$ = new Subject<void>();

	isDarkMode = false;
	isLoading = false;

	// Comparison Data
	selectedReports: LabReport[] = [];
	comparisonData: ComparisonData[] = [];

	// Chart Configuration
	public comparisonChartType: ChartType = 'bar';
	public comparisonChartData: ChartData<'bar'> = {
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
					text: 'Test Names'
				}
			}
		},
		plugins: {
			legend: {
				position: 'top',
			},
			tooltip: {
				callbacks: {
					label: (context) => {
						const datasetLabel = context.dataset.label || '';
						const value = context.parsed.y;
						return `${datasetLabel}: ${value}`;
					}
				}
			}
		}
	};

	constructor(private themeService: ThemeService) { }

	ngOnInit(): void {
		this.subscribeToTheme();
		this.initializeComparison();
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

	private initializeComparison(): void {
		if (this.labReports.length >= 2) {
			// Auto-select the two most recent reports
			this.selectedReports = this.labReports
				.sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime())
				.slice(0, 2);
			this.generateComparison();
		}
	}

	private generateComparison(): void {
		if (this.selectedReports.length < 2) return;

		this.comparisonData = [];
		const testNames = new Set<string>();

		// Collect all unique test names
		this.selectedReports.forEach(report => {
			report.results?.forEach(result => {
				testNames.add(result.testName);
			});
		});

		// Generate comparison data for each test
		testNames.forEach(testName => {
			const comparisonItem: ComparisonData = {
				testName,
				reports: []
			};

			this.selectedReports.forEach(report => {
				const result = report.results?.find(r => r.testName === testName);
				if (result) {
					comparisonItem.reports.push({
						report,
						value: result.value,
						status: result.status
					});
				}
			});

			// Calculate changes if we have exactly 2 reports
			if (comparisonItem.reports.length === 2) {
				const oldValue = comparisonItem.reports[1].value;
				const newValue = comparisonItem.reports[0].value;
				const change = newValue - oldValue;
				const changePercent = ((change / oldValue) * 100);

				comparisonItem.reports[0].change = change;
				comparisonItem.reports[0].changePercent = changePercent;
			}

			if (comparisonItem.reports.length > 0) {
				this.comparisonData.push(comparisonItem);
			}
		});

		this.updateComparisonChart();
	}

	private updateComparisonChart(): void {
		const labels = this.comparisonData.map(item => item.testName);
		const datasets = this.selectedReports.map((report, index) => {
			const color = this.getReportColor(index);
			const data = this.comparisonData.map(item => {
				const reportData = item.reports.find(r => r.report.id === report.id);
				return reportData ? reportData.value : 0;
			});

			return {
				label: this.formatReportLabel(report),
				data: data,
				backgroundColor: this.hexToRgba(color, 0.7),
				borderColor: color,
				borderWidth: 2
			};
		});

		this.comparisonChartData = {
			labels,
			datasets
		};
	}

	private updateChartTheme(): void {
		if (this.chartOptions && this.chartOptions.scales) {
			const gridColor = this.isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
			this.chartOptions.scales['y']!.grid!.color = gridColor;
			this.chartOptions.scales['x']!.grid!.color = gridColor;
		}
	}

	// Public Methods
	onReportSelectionChange(): void {
		this.generateComparison();
	}

	addReportToComparison(report: LabReport): void {
		if (!this.selectedReports.find(r => r.id === report.id)) {
			this.selectedReports.push(report);
			this.generateComparison();
		}
	}

	removeReportFromComparison(report: LabReport): void {
		this.selectedReports = this.selectedReports.filter(r => r.id !== report.id);
		this.generateComparison();
	}

	clearComparison(): void {
		this.selectedReports = [];
		this.comparisonData = [];
		this.comparisonChartData = { labels: [], datasets: [] };
	}

	exportComparison(): void {
		console.log('Export comparison data');
		// Implement export functionality
	}

	// Utility Methods
	private getReportColor(index: number): string {
		const colors = [
			'#4299ed', '#4caf50', '#ff9800', '#f44336',
			'#9c27b0', '#009688', '#795548', '#607d8b'
		];
		return colors[index % colors.length];
	}

	private hexToRgba(hex: string, alpha: number): string {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	formatReportLabel(report: LabReport): string {
		return `${report.reportType} (${new Date(report.reportDate).toLocaleDateString()})`;
	}

	formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	getChangeClass(change: number): string {
		if (change > 0) return 'change-increase';
		if (change < 0) return 'change-decrease';
		return 'change-stable';
	}

	getChangeIcon(change: number): string {
		if (change > 0) return 'trending_up';
		if (change < 0) return 'trending_down';
		return 'trending_flat';
	}

	getStatusClass(status: string): string {
		switch (status.toLowerCase()) {
			case 'critical': return 'status-critical';
			case 'high': return 'status-high';
			case 'low': return 'status-low';
			case 'abnormal': return 'status-abnormal';
			case 'normal': return 'status-normal';
			default: return 'status-normal';
		}
	}

	// FIXED: Add missing helper methods for template
	isReportSelected(report: LabReport): boolean {
		return this.selectedReports.some(r => r.id === report.id);
	}

	getImprovingCount(): number {
		if (this.selectedReports.length !== 2) return 0;

		let improving = 0;
		this.comparisonData.forEach(item => {
			if (item.reports.length === 2) {
				const change = item.reports[0].change || 0;
				if (this.isImprovingTrend(item.testName, change)) {
					improving++;
				}
			}
		});
		return improving;
	}

	getWorseningCount(): number {
		if (this.selectedReports.length !== 2) return 0;

		let worsening = 0;
		this.comparisonData.forEach(item => {
			if (item.reports.length === 2) {
				const change = item.reports[0].change || 0;
				if (!this.isImprovingTrend(item.testName, change) && Math.abs(change) >= 5) {
					worsening++;
				}
			}
		});
		return worsening;
	}

	getStableCount(): number {
		if (this.selectedReports.length !== 2) return 0;

		let stable = 0;
		this.comparisonData.forEach(item => {
			if (item.reports.length === 2) {
				const change = item.reports[0].change || 0;
				if (Math.abs(change) < 5) {
					stable++;
				}
			}
		});
		return stable;
	}

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
}
