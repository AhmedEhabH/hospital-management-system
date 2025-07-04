import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppointmentDto } from '../../../core/models';

@Component({
	selector: 'app-appointment-details-dialog',
	standalone: false,
	templateUrl: './appointment-details-dialog.component.html',
	styleUrl: './appointment-details-dialog.component.scss'
})
export class AppointmentDetailsDialogComponent {
	constructor(
		public dialogRef: MatDialogRef<AppointmentDetailsDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: AppointmentDto
	) { }

	// Function to close the dialog
	close(): void {
		this.dialogRef.close();
	}
}
