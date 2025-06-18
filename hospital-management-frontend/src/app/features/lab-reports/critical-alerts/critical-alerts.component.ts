import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-critical-alerts',
	standalone: false,
	templateUrl: './critical-alerts.component.html',
	styleUrl: './critical-alerts.component.scss'
})
export class CriticalAlertsComponent {
	@Input() patientId!: string | number;
}
