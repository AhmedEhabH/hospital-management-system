import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { CreateAppointmentDto } from '../../../core/models';

@Component({
	selector: 'app-patient-booking-wizard',
	standalone: false,
	templateUrl: './patient-booking-wizard.component.html',
	styleUrl: './patient-booking-wizard.component.scss'
})

export class PatientBookingWizardComponent implements OnInit {
	currentStep = 1;
	bookingForm: FormGroup;
	selectedDoctor: any = null; // Will hold doctor info
	selectedSlot: any = null;   // Will hold time slot info
	isLoading = false;

	constructor(
		private fb: FormBuilder,
		private appointmentService: AppointmentService,
		private authService: AuthService,
		private snackBar: MatSnackBar,
		private router: Router
	) {
		this.bookingForm = this.fb.group({
			title: ['Medical Consultation', Validators.required],
			notes: ['']
		});
	}

	ngOnInit(): void { }

	handleDoctorSelected(doctor: any) {
		this.selectedDoctor = doctor;
		this.currentStep = 2;
	}

	handleSlotSelected(slot: any) {
		this.selectedSlot = slot;
		this.currentStep = 3;
	}

	confirmBooking() {
		if (!this.selectedDoctor || !this.selectedSlot || !this.bookingForm.valid) {
			this.snackBar.open('Please complete all steps before confirming.', 'Close', { duration: 3000 });
			return;
		}

		this.isLoading = true;
		const currentUser = this.authService.getCurrentUser();

		const appointmentData: CreateAppointmentDto = {
			doctorId: this.selectedDoctor.id,
			patientId: currentUser.id,
			startTime: this.selectedSlot.startTime,
			durationInMinutes: 30, // Default duration
			title: this.bookingForm.value.title,
			notes: this.bookingForm.value.notes,
			date: this.selectedSlot.date,
			priority: 'Medium',
			type: 'Consultation'
		};

		this.appointmentService.createAppointment(appointmentData).subscribe({
			next: () => {
				this.snackBar.open('Appointment successfully booked!', 'Close', { duration: 5000, panelClass: ['success-snackbar'] });
				this.router.navigate(['/patient/dashboard']);
				this.isLoading = false;
			},
			error: (err) => {
				this.snackBar.open('Failed to book appointment. The slot may have just been taken.', 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
				this.isLoading = false;
			}
		});
	}

	goToStep(step: number) {
		this.currentStep = step;
	}
}