import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-lab-comparison',
	standalone: false,
	templateUrl: './lab-comparison.component.html',
	styleUrl: './lab-comparison.component.scss'
})
export class LabComparisonComponent {
	@Input() labReports!: any[];
}
