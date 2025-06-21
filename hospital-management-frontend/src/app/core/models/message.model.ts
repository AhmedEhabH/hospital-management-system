export interface MessageDto {
	id: number;
	senderId: number;
	receiverId: number;
	subject: string;
	messageContent: string;
	isRead: boolean;
	sentDate: Date;
}

export interface CriticalAlertRequest {
	patientId: number;
	labReportId: number;
	alertMessage: string;
}

export interface AppointmentReminderRequest {
	patientId: number;
	appointmentDate: Date;
	doctorName: string;
}

export interface EmergencyAlertRequest {
	patientId: number;
	emergencyDetails: string;
}
