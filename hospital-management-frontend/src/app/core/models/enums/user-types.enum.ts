export enum UserType {
	PATIENT = 'Patient',
	DOCTOR = 'Doctor',
	ADMIN = 'Admin'
}

export enum Gender {
	MALE = 'Male',
	FEMALE = 'Female',
	OTHER = 'Other'
}

export enum AlertType {
	CRITICAL = 'critical',
	WARNING = 'warning',
	INFO = 'info',
	EMERGENCY = 'emergency'
}

export enum MessageType {
	TEXT = 'text',
	IMAGE = 'image',
	FILE = 'file'
}

export enum Priority {
	CRITICAL = 'critical',
	HIGH = 'high',
	MEDIUM = 'medium',
	LOW = 'low'
}

export enum NotificationType {
	MEDICAL = 'medical',
	APPOINTMENT = 'appointment',
	EMERGENCY = 'emergency',
	SYSTEM = 'system'
}

export enum UserStatus {
	ONLINE = 'online',
	OFFLINE = 'offline',
	AWAY = 'away',
	BUSY = 'busy'
}
