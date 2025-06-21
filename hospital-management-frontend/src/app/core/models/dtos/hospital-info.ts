export interface HospitalInfoDto {
	id: number;
	hospitalName: string;
	address: string;
	city: string;
	phoneNumber?: string;
	email?: string;
	description?: string;
	createdAt: string; // ISO date string
	updatedAt?: string; // ISO date string
}
