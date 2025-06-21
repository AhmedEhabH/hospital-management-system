// Re-export DTO for backward compatibility
export * from './dtos/medical-history';

// Additional medical history interfaces
export interface MedicalHistoryForm {
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
}
