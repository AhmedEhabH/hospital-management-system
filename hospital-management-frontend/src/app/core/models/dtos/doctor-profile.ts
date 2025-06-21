export interface DoctorProfileDto {
	id: number;
	userId: number;
	hospitalName: string;
	qualification: string;
	experience: number;
	specialistIn: string;
	licenseNumber: string;
	specialization?: string;
	biography?: string;
	education?: string;
	certifications?: string;
	department?: string;
	officeLocation?: string;
	directPhone?: string;
	professionalEmail?: string;
	isAvailableForConsultation: boolean;
	consultationFee: number;
	workingHours?: string;
	medicalSchool?: string;
	residency?: string;
	fellowship?: string;
	researchInterests?: string;
	publications?: string;
	languages?: string;
	acceptsNewPatients: boolean;
	acceptsInsurance: boolean;
	insuranceAccepted?: string;
	createdAt: string; // ISO date string
	updatedAt?: string; // ISO date string

	// User information
	doctorName?: string;
	email?: string;
	phoneNo?: string;
}
