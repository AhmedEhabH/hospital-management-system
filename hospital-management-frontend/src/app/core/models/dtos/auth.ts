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

export interface LoginDto {
	userId: string;
	password: string;
	userType: string;
}

export interface RegistrationResultDto {
	success: boolean;
	message: string;
	userId?: number;
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
