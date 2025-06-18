import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-lab-trends-analysis',
	standalone: false,
	templateUrl: './lab-trends-analysis.component.html',
	styleUrl: './lab-trends-analysis.component.scss'
})
export class LabTrendsAnalysisComponent {
	@Input() patientId!: string | number;
}
