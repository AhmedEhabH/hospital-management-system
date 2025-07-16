export interface MessageDto {
	id: number;
	senderId: number;
	receiverId: number;
	subject: string;
	messageContent: string;
	isRead: boolean;
	sentDate: string; // ISO date string
}

export interface MessageTemplate {
  name: string;
  template: string;
}

export interface RecipientDto {
  id: number;
  name: string;
  type: 'Doctor' | 'Patient' | 'Admin';
  email: string;
}