// Re-export DTO for backward compatibility
export * from './dtos/lab-report';

// Additional lab report interfaces
export interface LabReportForm {
  testedBy: string;
  testPerformed: string;
  phLevel: number;
  cholesterolLevel: number;
  sucroseLevel: number;
  whiteBloodCellsRatio: number;
  redBloodCellsRatio: number;
  heartBeatRatio: number;
  reports?: string;
  testedDate: string;
}

export interface LabReportSummary {
  id: number;
  testPerformed: string;
  testedDate: string;
  status: 'critical' | 'warning' | 'normal';
  priority: 'high' | 'medium' | 'low';
}
