import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService } from '../../../core/services/appointment.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
	selector: 'app-appointment-booking-dialog',
	standalone: false,
	templateUrl: './appointment-booking-dialog.component.html',
})
export class AppointmentBookingDialogComponent {
	form: FormGroup;
	isLoading = false;

	constructor(
		public dialogRef: MatDialogRef<AppointmentBookingDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private appointmentService: AppointmentService,
		private snackBar: MatSnackBar
	) {
		this.form = this.fb.group({
			patientId: ['', Validators.required],
			startTime: ['', Validators.required],
			title: ['Consultation', Validators.required],
			notes: [''],
		});
	}

	onCancel(): void {
		this.dialogRef.close();
	}

	onConfirm(): void {
		if (this.form.valid) {
			this.isLoading = true;
			const appointmentData = {
				...this.form.value,
				doctorId: this.data.doctorId,
			};
			this.appointmentService.createAppointment(appointmentData).subscribe({
				next: () => {
					this.snackBar.open('Appointment booked successfully!', 'OK', { duration: 3000 });
					this.dialogRef.close(true);
					this.isLoading = false;
				},
				error: (err) => {
					this.snackBar.open('Failed to book appointment. Please try again.', 'OK', { duration: 3000 });
					this.isLoading = false;
				},
			});
		}
	}
}
