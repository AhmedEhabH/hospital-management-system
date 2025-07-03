export interface CriticalAlertRequest {
	patientId: number;
	labReportId: number;
	alertMessage: string;
}

export interface AppointmentReminderRequest {
	patientId: number;
	appointmentDate: string; // ISO date string
	doctorName: string;
}

export interface EmergencyAlertRequest {
	patientId: number;
	emergencyDetails: string;
}

export interface NotificationData {
	title: string;
	message: string;
	type: 'medical' | 'appointment' | 'emergency' | 'system';
	priority: 'critical' | 'high' | 'medium' | 'low';
	timestamp: Date;
	actionUrl?: string;
	data?: any;
}

export interface MedicalAlert {
	id: string;
	patientId: number;
	patientName: string;
	alertType: 'critical' | 'warning' | 'info' | 'emergency';
	title: string;
	message: string;
	timestamp: Date;
	labReportId?: number;
	priority: 'high' | 'medium' | 'low';
	actionUrl?: string;
	acknowledged: boolean;
	doctorNotified: boolean;
}

// export interface ChatMessage {
// 	id: string;
// 	senderId: number;
// 	receiverId: number;
// 	content: string;
// 	timestamp: Date;
// 	isRead: boolean;
// 	messageType: 'text' | 'image' | 'file';
// 	conversationId: string;
// }

export interface TypingIndicator {
	userId: number;
	userName: string;
	isTyping: boolean;
	conversationId: string;
}
export interface NotificationData {
	title: string;
	message: string;
	type: 'medical' | 'appointment' | 'emergency' | 'system';
	priority: 'critical' | 'high' | 'medium' | 'low';
	timestamp: Date;
	actionUrl?: string;
	data?: any;
}

export interface MedicalAlert {
	id: string;
	patientId: number;
	patientName: string;
	alertType: 'critical' | 'warning' | 'info' | 'emergency';
	title: string;
	message: string;
	timestamp: Date;
	labReportId?: number;
	priority: 'high' | 'medium' | 'low';
	actionUrl?: string;
	acknowledged: boolean;
	doctorNotified: boolean;
}

// export interface ChatMessage {
// 	id: string;
// 	senderId: number;
// 	receiverId: number;
// 	content: string;
// 	timestamp: Date;
// 	isRead: boolean;
// 	messageType: 'text' | 'image' | 'file';
// 	conversationId: string;
// }

export interface UserPresence {
	userId: number | string;
	userName: string;
	isOnline: boolean;
	lastSeen: Date | string;
	status: 'online' | 'offline' | 'away' | 'busy';
	userType?: string;
	connectionCount? : number;
}


export interface TypingIndicator {
	userId: number;
	userName: string;
	isTyping: boolean;
	conversationId: string;
}

export interface Message {
	id: number;
	senderId: number;
	receiverId: number;
	subject: string;
	messageContent: string;
	isRead: boolean;
	sentDate: Date;
	// Extended properties for chat functionality
	senderName?: string | null;
	receiverName?: string | null;
	messageType?: 'text' | 'image' | 'file' | 'system';
	attachmentUrl?: string;
	attachmentName?: string;
	conversationId?: string;
}

export interface Conversation {
	id: string;
	participants: ConversationParticipant[];
	lastMessage?: Message | null;
	lastMessageAt: Date;
	unreadCount: number;
	conversationType: 'private' | 'group' | 'medical_team';
	title?: string;
	description?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ConversationParticipant {
	userId: number;
	userName: string;
	userType: 'Patient' | 'Doctor' | 'Admin';
	avatar?: string;
	isOnline: boolean;
	lastSeen: Date;
}

export interface ConversationItem {
	createdAt?:Date;
	updatedAt?:Date;
	id: string;
	title: string;
	lastMessage?: Message | string | null;
	lastMessageAt?: Date;
	unreadCount?: number;
	participants: any[];
	isOnline: boolean;
	conversationType: 'private' | 'group' | 'medical_team'; // FIXED: Add missing property
}

export interface ChatMessage {
	id: string;
	senderId: number;
	senderName: string | null; // Allow null for SignalR compatibility
	receiverId: number;
	receiverName: string;
	message: string; // Maps to messageContent in Message
	timestamp: Date; // Maps to sentDate in Message
	messageType: 'text' | 'image' | 'file' | 'system';
	isRead: boolean;
	conversationId: string;
	attachmentUrl?: string;
	attachmentName?: string;
}



export interface MessageAttachment {
	id: string;
	fileName: string;
	fileSize: number;
	fileType: string;
	url: string;
	thumbnailUrl?: string;
}


export interface FilePreview {
	file: File;
	preview?: string;
	type: string;
}

// export interface Conversation {
// 	id: string;
// 	title: string;
// 	conversationType: 'direct' | 'group';
// 	participants: any[];
// }

export interface CriticalAlert {
	patientId: number;
	labReportId?: number;
	alertMessage: string;
	alertType: 'Critical' | 'Warning' | 'Emergency';
	createdAt: string;
	doctorName: string;
	patientName: string;
}

export interface AppointmentReminder {
	patientId: number;
	appointmentDate: string;
	doctorName: string;
	department: string;
	reminderMessage: string;
}

export interface SystemNotification {
	message: string;
	type: 'Info' | 'Warning' | 'Maintenance';
	createdAt: string;
	title: string;
}

export interface OnlineUser {
	userId: string;
	userType: string;
	connectionCount: number;
	lastSeen: string;
}
