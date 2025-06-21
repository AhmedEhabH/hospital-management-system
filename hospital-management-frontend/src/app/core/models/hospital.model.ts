export interface HospitalInfoDto {
	id: number;
	hospitalName: string;
	address: string;
	city: string;
	phoneNumber: string;
	email: string;
	description: string;
	createdAt: Date;
	updatedAt?: Date;
}
