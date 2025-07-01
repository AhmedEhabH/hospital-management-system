/**
 * Appointment Data Transfer Object
 * 
 * Represents appointment information for the hospital management system
 * with proper typing for medical appointment scheduling and management
 */
export interface AppointmentDto {
	id: number;
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
