export interface HealthMetrics {
	bloodPressure: {
		systolic: number;
		diastolic: number;
		status: string;
	};
	heartRate: {
		value: number;
		status: string;
	};
	weight: {
		value: number;
		unit: string;
		trend: string;
	};
	temperature: {
		value: number;
		unit: string;
		status: string;
	};
}

export interface AlertStats {
	totalAlerts: number;
	newAlerts: number;
	criticalAlerts: number;
	acknowledgedAlerts: number;
}
