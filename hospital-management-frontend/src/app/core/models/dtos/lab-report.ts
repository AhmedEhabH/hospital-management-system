export interface LabReportDto {
	id: number;
	patientId: number;
	testedBy: string;
	testPerformed: string;
	phLevel: number;
	cholesterolLevel: number;
	sucroseLevel: number;
	whiteBloodCellsRatio: number;
	redBloodCellsRatio: number;
	heartBeatRatio: number;
	reports?: string;
	testedDate: string; // ISO date string
	createdAt: string; // ISO date string
}
