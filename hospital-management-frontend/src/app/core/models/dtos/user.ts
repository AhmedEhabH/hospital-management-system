/**
 * Current User DTO
 * 
 * Represents the currently authenticated user with comprehensive information
 */
export interface CurrentUserDto {
	id: number;
	userId: string;
	firstName: string;
	lastName: string;
	email: string;
	userType: 'Admin' | 'Doctor' | 'Patient';
	fullName: string;
	displayName: string;
	avatar?: string;
	lastLogin?: string;
	isActive: boolean;
	phoneNo?: string;
	address?: string;
	city?: string;
	state?: string;
	department?: string;
	specialization?: string;
	permissions?: string[];
	preferences?: UserPreferences;
}

/**
 * User Preferences DTO
 */
export interface UserPreferences {
	theme: 'light' | 'dark' | 'auto';
	language: string;
	notifications: {
		email: boolean;
		sms: boolean;
		push: boolean;
	};
	dashboard: {
		layout: 'grid' | 'list';
		showWelcome: boolean;
		compactMode: boolean;
	};
}

/**
 * User Session DTO
 */
export interface UserSessionDto {
	user: CurrentUserDto;
	token: string;
	expiresAt: string;
	issuedAt: string;
	permissions: string[];
}
