/**
 * User Registration Data Transfer Object
 * 
 * Comprehensive patient registration model following healthcare standards
 * with proper validation and medical information integration
 */
export interface UserRegistrationDto {
	firstName: string;
	lastName: string;
	gender: 'Male' | 'Female' | 'Other';
	age: number;
	dateOfBirth?: string;
	userId: string;
	password: string;
	email: string;
	address: string;
	city: string;
	state: string;
	zip: string;
	phoneNo: string;
	userType: 'Admin' | 'Doctor' | 'Patient';
	emergencyContactName?: string;
	emergencyContactPhone?: string;
	emergencyContactRelation?: string;
	insuranceProvider?: string;
	insurancePolicyNumber?: string;
	medicalConditions?: string;
	currentMedications?: string;
	allergies?: string;
}

/**
 * Registration Result DTO
 */
export interface RegistrationResultDto {
	success: boolean;
	message: string;
	userId?: number;
	errors?: string[];
}

/**
 * Registration Validation DTO
 */
export interface RegistrationValidationDto {
	field: string;
	message: string;
	isValid: boolean;
}
