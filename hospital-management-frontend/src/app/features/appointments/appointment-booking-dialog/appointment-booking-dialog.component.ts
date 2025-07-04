import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService } from '../../../core/services/appointment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { CreateAppointmentDto, DoctorAvailabilityDto } from '../../../core/models';

@Component({
	selector: 'app-appointment-booking-dialog',
	standalone: false,
	templateUrl: './appointment-booking-dialog.component.html',
})
export class AppointmentBookingDialogComponent implements OnInit {
	bookingForm: FormGroup;
	isLoading = false;
	availableSlots: any[] = [];
	selectedDate: Date;

	constructor(
		public dialogRef: MatDialogRef<AppointmentBookingDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private appointmentService: AppointmentService,
		private authService: AuthService,
		private snackBar: MatSnackBar
	) {
		/* this.bookingForm = this.fb.group({
			patientId: ['', Validators.required],
			startTime: ['', Validators.required],
			title: ['Consultation', Validators.required],
			notes: [''],
		}); */
		this.selectedDate = data.selectedDate || new Date();
		this.bookingForm = this.createForm();
	}
	ngOnInit(): void {
		this.loadAvailableSlots();
	}

	private createForm(): FormGroup {
		return this.fb.group({
			patientId: ['', Validators.required],
			selectedSlot: ['', Validators.required],
			title: ['Medical Consultation', Validators.required],
			notes: [''],
			durationInMinutes: [30, [Validators.required, Validators.min(15), Validators.max(120)]]
		});
	}

	private loadAvailableSlots(): void {
		this.appointmentService.getDoctorAvailability(this.data.doctorId, this.selectedDate)
			.subscribe({
				next: (availability: DoctorAvailabilityDto) => {
					this.availableSlots = availability.availableSlots.map(slot => ({
						startTime: slot.startTime,
						endTime: slot.endTime,
						displayTime: this.formatTimeSlot(slot.startTime, slot.endTime)
					}));
				},
				error: (error) => {
					console.error('Error loading availability:', error);
					this.snackBar.open('Error loading available slots', 'Close', { duration: 3000 });
				}
			});
	}

	private formatTimeSlot(startTime: string, endTime: string): string {
		const start = new Date(startTime);
		const end = new Date(endTime);
		return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
	}

	onCancel(): void {
		this.dialogRef.close();
	}

	public onConfirm(): void {
		if (this.bookingForm.valid) {
			this.isLoading = true;

			const selectedSlot = this.bookingForm.value.selectedSlot;
			const appointmentData: CreateAppointmentDto = {
				doctorId: this.data.doctorId,
				patientId: this.bookingForm.value.patientId,
				startTime: selectedSlot.startTime,
				durationInMinutes: this.bookingForm.value.durationInMinutes,
				title: this.bookingForm.value.title,
				notes: this.bookingForm.value.notes,
				date: selectedSlot.startTime,
				time: selectedSlot.startTime,
				department: this.data.department,
				type: this.data.type,
				priority: this.data.priority
			};

			this.appointmentService.createAppointment(appointmentData).subscribe({
				next: () => {
					this.dialogRef.close(true);
					this.isLoading = false;
				},
				error: (error) => {
					console.error('Error booking appointment:', error);
					this.snackBar.open('Failed to book appointment. Please try again.', 'Close', { duration: 3000 });
					this.isLoading = false;
				}
			});
		}
	}
}
