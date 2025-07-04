import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { startOfDay, endOfDay, addDays, isSameDay, isSameMonth, endOfWeek, startOfWeek } from 'date-fns';
import { Subject, takeUntil } from 'rxjs';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentBookingDialogComponent } from '../appointment-booking-dialog/appointment-booking-dialog.component';

import { AppointmentDto, CalendarAppointmentEvent } from '../../../core/models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SignalrService } from '../../../core/services/signalr.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AppointmentDetailsDialogComponent } from '../appointment-details-dialog/appointment-details-dialog.component';

@Component({
	selector: 'app-appointment-scheduler',
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: false,
	templateUrl: './appointment-scheduler.component.html',
	styleUrls: ['./appointment-scheduler.component.scss']
})
export class AppointmentSchedulerComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();

	isDarkMode = false;

	view: CalendarView = CalendarView.Week;
	CalendarView = CalendarView;
	viewDate: Date = new Date();
	activeDayIsOpen: boolean = true;
	refresh = new Subject<void>();

	// events: CalendarEvent<CalendarAppointmentEvent>[] = [];
	events: CalendarEvent<AppointmentDto>[] = [];

	currentUser: any;
	isLoading = false;

	// Calendar colors
	colors: any = {
		scheduled: {
			primary: '#4299ed',
			secondary: '#D1E8FF'
		},
		inProgress: {
			primary: '#ff9800',
			secondary: '#FFE0B2'
		},
		completed: {
			primary: '#4caf50',
			secondary: '#C8E6C8'
		},
		cancelled: {
			primary: '#f44336',
			secondary: '#FFCDD2'
		}
	};

	constructor(
		private appointmentService: AppointmentService,
		private signalrService: SignalrService,
		private authService: AuthService,
		private dialog: MatDialog,
		private snackBar: MatSnackBar,
		private cdr: ChangeDetectorRef,
		private themeService: ThemeService
	) { }

	ngOnInit(): void {
		this.subscribeToTheme();
		this.currentUser = this.authService.getCurrentUser();
		this.setupSignalRListeners();
		this.fetchAppointments();
		this.subscribeToAppointmentUpdates();
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
			});
	}

	/**
	 * Setup SignalR listeners for real-time updates
	 */
	private setupSignalRListeners(): void {
		// Listen for appointment changes
		this.signalrService.connectionState$
			.pipe(takeUntil(this.destroy$))
			.subscribe(state => {
				if (state === 'Connected') {
					console.log('✅ SignalR connected - listening for appointment updates');
				}
			});
	}

	/**
	 * Subscribe to appointment updates from service
	 */
	private subscribeToAppointmentUpdates(): void {
		this.appointmentService.appointments$
			.pipe(takeUntil(this.destroy$))
			.subscribe(appointments => {
				this.updateCalendarEvents(appointments);
				this.cdr.detectChanges();
			});
	}

	/**
   * Fetch appointments for current view
   */
	private fetchAppointments(): void {
		if (!this.currentUser) return;

		this.isLoading = true;
		const doctorId = this.currentUser.userType === 'Doctor' ? this.currentUser.id : 1;

		// Get date range based on current view
		const { start, end } = this.getViewDateRange();

		this.appointmentService.getDoctorAppointments(doctorId, start, end)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (appointments) => {
					this.updateCalendarEvents(appointments);
					this.isLoading = false;
					this.cdr.detectChanges();
				},
				error: (error) => {
					console.error('Error loading appointments:', error);
					this.snackBar.open('Error loading appointments', 'Close', { duration: 3000 });
					this.isLoading = false;
					this.cdr.detectChanges();
				}
			});
	}

	/**
   * Get date range for current calendar view
   */
	private getViewDateRange(): { start: Date; end: Date } {
		switch (this.view) {
			case CalendarView.Month:
				return {
					start: startOfDay(startOfWeek(this.viewDate)),
					end: endOfDay(endOfWeek(addDays(this.viewDate, 35)))
				};
			case CalendarView.Week:
				return {
					start: startOfDay(startOfWeek(this.viewDate)),
					end: endOfDay(endOfWeek(this.viewDate))
				};
			case CalendarView.Day:
				return {
					start: startOfDay(this.viewDate),
					end: endOfDay(this.viewDate)
				};
			default:
				return {
					start: startOfDay(this.viewDate),
					end: endOfDay(addDays(this.viewDate, 7))
				};
		}
	}

	/**
	 * Update calendar events from appointment data
	 */
	private updateCalendarEvents(appointments: AppointmentDto[]): void {
		this.events = appointments.map(appointment => ({
			id: appointment.id,
			start: new Date(appointment.startTime),
			end: new Date(appointment.endTime),
			title: `${appointment.title} - ${appointment.patientName}`,
			color: this.getAppointmentColor(appointment.status),
			meta: appointment,
			draggable: appointment.status === 'Scheduled',
			resizable: {
				beforeStart: false,
				afterEnd: appointment.status === 'Scheduled'
			}
		}));

		this.refresh.next();
	}

	/**
	 * Get color scheme based on appointment status
	 */
	private getAppointmentColor(status: string): any {
		switch (status.toLowerCase()) {
			case 'scheduled': return this.colors.scheduled;
			case 'in progress': return this.colors.inProgress;
			case 'completed': return this.colors.completed;
			case 'cancelled': return this.colors.cancelled;
			default: return this.colors.scheduled;
		}
	}

	/**
	 * Handle day click events
	 */
	public dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
		if (isSameMonth(date, this.viewDate)) {
			this.activeDayIsOpen = !((isSameDay(this.viewDate, date) && this.activeDayIsOpen) || events.length === 0);
			this.viewDate = date;
		}
	}

	/**
  * Handle appointment event clicks
  */
	public handleEvent(action: string, event: CalendarEvent<AppointmentDto>): void {
		console.log(`Action: ${action}, Event:`, event);

		if (action === 'Clicked' && event.meta) {
			this.viewAppointmentDetails(event.meta);
		}
	}

	/**
	 * Handle time slot clicks for new appointments
	 */
	public hourSegmentClicked(date: Date): void {
		this.openBookingDialog(date);
	}

	/**
	 * Set calendar view
	 */
	public setView(view: CalendarView): void {
		this.view = view;
		this.fetchAppointments();
	}

	/**
	 * Navigate to previous period
	 */
	public previousPeriod(): void {
		switch (this.view) {
			case CalendarView.Month:
				this.viewDate = addDays(this.viewDate, -30);
				break;
			case CalendarView.Week:
				this.viewDate = addDays(this.viewDate, -7);
				break;
			case CalendarView.Day:
				this.viewDate = addDays(this.viewDate, -1);
				break;
		}
		this.fetchAppointments();
	}

	/**
	 * Navigate to next period
	 */
	public nextPeriod(): void {
		switch (this.view) {
			case CalendarView.Month:
				this.viewDate = addDays(this.viewDate, 30);
				break;
			case CalendarView.Week:
				this.viewDate = addDays(this.viewDate, 7);
				break;
			case CalendarView.Day:
				this.viewDate = addDays(this.viewDate, 1);
				break;
		}
		this.fetchAppointments();
	}

	/**
	 * Go to today
	 */
	public goToToday(): void {
		this.viewDate = new Date();
		this.fetchAppointments();
	}

	/**
	 * Close open day view
	 */
	public closeOpenMonthViewDay(): void {
		this.activeDayIsOpen = false;
	}

	/**
	 * Open appointment booking dialog
	 */
	public openBookingDialog(selectedDate?: Date): void {
		const dialogRef = this.dialog.open(AppointmentBookingDialogComponent, {
			width: '600px',
			maxWidth: '90vw',
			data: {
				doctorId: this.currentUser?.userType === 'Doctor' ? this.currentUser.id : 1,
				selectedDate: selectedDate || new Date()
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.fetchAppointments(); // Refresh calendar after booking
				this.snackBar.open('Appointment booked successfully!', 'Close', {
					duration: 3000,
					panelClass: ['success-snackbar']
				});
			}
		});
	}

	/**
	 * View appointment details
	 */
	private viewAppointmentDetails(appointment: AppointmentDto): void {
		// Open appointment details dialog or navigate to details page
		console.log('Viewing appointment details:', appointment);
		this.dialog.open(AppointmentDetailsDialogComponent, {
			width: '500px',
			data: appointment // Pass the appointment object to the dialog
		});
	}

	/**
	 * Start appointment (change status to In Progress)
	 */
	public startAppointment(appointment: AppointmentDto): void {
		this.appointmentService.updateAppointmentStatus(appointment.id, 'In Progress')
			.subscribe({
				next: () => {
					this.snackBar.open('Appointment started', 'Close', { duration: 3000 });
				},
				error: (error) => {
					console.error('Error starting appointment:', error);
					this.snackBar.open('Error starting appointment', 'Close', { duration: 3000 });
				}
			});
	}

	/**
	 * Complete appointment
	 */
	public completeAppointment(appointment: AppointmentDto): void {
		this.appointmentService.updateAppointmentStatus(appointment.id, 'Completed')
			.subscribe({
				next: () => {
					this.snackBar.open('Appointment completed', 'Close', { duration: 3000 });
				},
				error: (error) => {
					console.error('Error completing appointment:', error);
					this.snackBar.open('Error completing appointment', 'Close', { duration: 3000 });
				}
			});
	}

	/**
	 * Refresh calendar data
	 */
	public refreshCalendar(): void {
		this.fetchAppointments();
	}

	/* 
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
		} */

	/* dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
		if (isSameMonth(date, this.viewDate)) {
			this.activeDayIsOpen = !((isSameDay(this.viewDate, date) && this.activeDayIsOpen) || events.length === 0);
			this.viewDate = date;
		}
	} */

	/* handleEvent(action: string, event: CalendarEvent): void {
		console.log(`Action: ${action}, Event:`, event);
	} */

	/* setView(view: CalendarView) {
		this.view = view;
	} */

	/* closeOpenMonthViewDay() {
		this.activeDayIsOpen = false;
	} */

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
