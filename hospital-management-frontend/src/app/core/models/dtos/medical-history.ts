/* export interface MedicalHistoryDto {
	id: number;
	userId: number;
	personalHistory?: string;
	familyHistory?: string;
	allergies?: string;
	frequentlyOccurringDisease?: string;
	hasAsthma: boolean;
	hasBloodPressure: boolean;
	hasCholesterol: boolean;
	hasDiabetes: boolean;
	hasHeartDisease: boolean;
	usesTobacco: boolean;
	cigarettePacksPerDay: number;
	smokingYears: number;
	drinksAlcohol: boolean;
	alcoholicDrinksPerWeek: number;
	currentMedications?: string;
	// FIXED: Add missing timestamp properties
	createdAt: string; // ISO date string
	updatedAt?: string; // ISO date string
} */

export interface MedicalHistoryDto {
	id?: number;
	userId: number;
	personalHistory?: string;
	familyHistory?: string;
	allergies?: string;
	frequentlyOccurringDisease?: string;
	hasAsthma: boolean;
	hasBloodPressure: boolean;
	hasCholesterol: boolean;
	hasDiabetes: boolean;
	hasHeartDisease: boolean;
	usesTobacco: boolean;
	cigarettePacksPerDay: number;
	smokingYears: number;
	drinksAlcohol: boolean;
	alcoholicDrinksPerWeek: number;
	currentMedications?: string;
	createdAt: string; // ISO date string
	updatedAt?: string; // ISO date string
}