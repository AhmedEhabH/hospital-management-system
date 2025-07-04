/**
 * Appointment Data Transfer Object
 * 
 * Represents appointment information for the hospital management system
 * with proper typing for medical appointment scheduling and management
 */
export interface AppointmentDto {
	id: number;
	title: string;
	doctorName: string;
	patientName: string;
	date: string; // ISO date string
	time: string;
	department: string;
	type: string;
	status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
	priority?: 'High' | 'Medium' | 'Low';
	notes?: string;
	patientId?: number;
	doctorId?: number;
	startTime: string; // Use string for ISO date format
	endTime: string;   // Use string for ISO date format
}

export interface CreateAppointmentDto {
	doctorId: number;
	patientId: number;
	startTime: string;
	durationInMinutes?: number;
	title: string;
	notes?: string;
}

// FIXED: Add the missing DoctorAvailabilityDto
export interface DoctorAvailabilityDto {
	doctorId: number;
	availableSlots: TimeSlot[];
}

export interface TimeSlot {
	startTime: string;
	endTime: string;
}

/**
 * Appointment Status Update DTO
 */
export interface AppointmentStatusUpdateDto {
	appointmentId: number;
	status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
	notes?: string;
	updatedBy: number;
}

/**
 * Appointment Creation DTO
 */
export interface CreateAppointmentDto {
	doctorId: number;
	patientId: number;
	date: string;
	time: string;
	department: string;
	type: string;
	priority: 'High' | 'Medium' | 'Low';
	notes?: string;
}

/**
 * Appointment Reschedule DTO
 */
export interface RescheduleAppointmentDto {
	appointmentId: number;
	newDate: string;
	newTime: string;
	reason?: string;
}

/**
 * Calendar Event interface for angular-calendar integration
 */
export interface CalendarAppointmentEvent {
	id?: number;
	start: Date;
	end: Date;
	title: string;
	color: {
		primary: string;
		secondary: string;
	};
	meta: AppointmentDto;
	draggable?: boolean;
	resizable?: {
		beforeStart?: boolean;
		afterEnd?: boolean;
	};
}