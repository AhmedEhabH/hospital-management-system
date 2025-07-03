import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { startOfDay, endOfDay, addDays, isSameDay, isSameMonth } from 'date-fns';
import { Subject } from 'rxjs';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentBookingDialogComponent } from '../appointment-booking-dialog/appointment-booking-dialog.component';

import { AppointmentDto } from '../../../core/models';

@Component({
	selector: 'app-appointment-scheduler',
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: false,
	templateUrl: './appointment-scheduler.component.html',
	styleUrls: ['./appointment-scheduler.component.scss']
})
export class AppointmentSchedulerComponent implements OnInit {
	view: CalendarView = CalendarView.Week;
	CalendarView = CalendarView;
	viewDate: Date = new Date();
	activeDayIsOpen: boolean = true;
	refresh = new Subject<void>();

	events: CalendarEvent[] = [];

	currentUser: any;

	constructor(
		private appointmentService: AppointmentService,
		private authService: AuthService,
		public dialog: MatDialog
	) { }

	ngOnInit(): void {
		this.currentUser = this.authService.getCurrentUser();
		this.fetchAppointments();
	}

	fetchAppointments(): void {
		// This example fetches for a hardcoded doctor ID. In a real app,
		// this would be dynamic.
		const doctorId = this.currentUser?.userType === 'Doctor' ? this.currentUser.id : 1;

		this.appointmentService.getDoctorAppointments(doctorId, startOfDay(this.viewDate), endOfDay(addDays(this.viewDate, 6)))
			.subscribe((appointments: AppointmentDto[]) => {
				this.events = appointments.map(appt => ({
					start: new Date(appt.startTime),
					end: new Date(appt.endTime),
					title: `${appt.title} - ${appt.patientName}`,
					color: { primary: '#1e90ff', secondary: '#D1E8FF' },
					meta: appt,
				}));
				this.refresh.next();
			});
	}

	dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
		if (isSameMonth(date, this.viewDate)) {
			this.activeDayIsOpen = !((isSameDay(this.viewDate, date) && this.activeDayIsOpen) || events.length === 0);
			this.viewDate = date;
		}
	}

	handleEvent(action: string, event: CalendarEvent): void {
		console.log(`Action: ${action}, Event:`, event);
	}

	setView(view: CalendarView) {
		this.view = view;
	}

	closeOpenMonthViewDay() {
		this.activeDayIsOpen = false;
	}

	bookAppointment(): void {
		const dialogRef = this.dialog.open(AppointmentBookingDialogComponent, {
			width: '500px',
			data: { doctorId: 1 } // Pass relevant data
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.fetchAppointments(); // Refresh calendar after booking
			}
		});
	}
}
