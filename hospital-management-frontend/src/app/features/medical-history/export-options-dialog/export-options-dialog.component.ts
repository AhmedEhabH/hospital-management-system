import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
	selector: 'app-export-options-dialog',
	standalone:false,
	templateUrl: './export-options-dialog.component.html',
	styleUrls: ['./export-options-dialog.component.scss']
})
export class ExportOptionsDialogComponent {
	selectedFormat = 'pdf';

	exportFormats = [
		{ value: 'pdf', label: 'PDF Report', icon: 'picture_as_pdf', description: 'Printable report with formatting' },
		{ value: 'csv', label: 'CSV File', icon: 'table_chart', description: 'Spreadsheet compatible format' },
		{ value: 'json', label: 'JSON Data', icon: 'code', description: 'Raw data for developers' }
	];

	constructor(
		public dialogRef: MatDialogRef<ExportOptionsDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: { totalEvents: number; patientName: string }
	) { }

	onExport(): void {
		this.dialogRef.close({ format: this.selectedFormat });
	}

	onCancel(): void {
		this.dialogRef.close();
	}
}
