export interface User {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	userType: 'Admin' | 'Doctor' | 'Patient';
	userId: string;
	gender: string;
	age: number;
	address: string;
	city: string;
	state: string;
	zip: string;
	phoneNo: string;
	createdAt: Date;
	updatedAt?: Date;
}

export interface LoginDto {
	userId: string;
	password: string;
	userType: string;
}

export interface UserRegistrationDto {
	firstName: string;
	lastName: string;
	gender: string;
	age: number;
	userId: string;
	password: string;
	email: string;
	address: string;
	city: string;
	state: string;
	zip: string;
	phoneNo: string;
	userType: string;
}

export interface AuthResultDto {
	success: boolean;
	message: string;
	token?: string;
	user?: UserInfoDto;
}

export interface UserInfoDto {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	userType: string;
	userId: string;
}

export interface RegistrationResultDto {
	success: boolean;
	message: string;
	userId?: number;
}
