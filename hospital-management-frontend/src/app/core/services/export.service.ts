import { Injectable } from '@angular/core';

interface TimelineEvent {
	id: string;
	date: Date;
	title: string;
	description: string;
	icon: string;
	color: string;
	type: 'medical' | 'appointment' | 'medication' | 'test' | 'surgery' | 'emergency';
	priority: 'high' | 'medium' | 'low';
	data?: any;
	tags: string[];
}

@Injectable({
	providedIn: 'root'
})
export class ExportService {

	constructor() { }

	exportTimelineToCSV(events: TimelineEvent[], filename: string = 'medical-timeline'): void {
		const csvContent = this.convertToCSV(events);
		this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
	}

	exportTimelineToPDF(events: TimelineEvent[], patientName: string = 'Patient'): void {
		const htmlContent = this.generateHTMLReport(events, patientName);
		this.printHTML(htmlContent);
	}

	exportTimelineToJSON(events: TimelineEvent[], filename: string = 'medical-timeline'): void {
		const jsonContent = JSON.stringify(events, null, 2);
		this.downloadFile(jsonContent, `${filename}.json`, 'application/json');
	}

	private convertToCSV(events: TimelineEvent[]): string {
		const headers = ['Date', 'Title', 'Type', 'Priority', 'Description', 'Tags'];
		const csvRows = [headers.join(',')];

		events.forEach(event => {
			const row = [
				this.formatDateForCSV(event.date),
				`"${event.title.replace(/"/g, '""')}"`,
				event.type,
				event.priority,
				`"${event.description.replace(/"/g, '""')}"`,
				`"${event.tags.join(', ')}"`
			];
			csvRows.push(row.join(','));
		});

		return csvRows.join('\n');
	}

	private generateHTMLReport(events: TimelineEvent[], patientName: string): string {
		const sortedEvents = events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

		return `
<!DOCTYPE html>
<html>
<head>
    <title>Medical Timeline Report - ${patientName}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #4299ed;
        }
        .header h1 {
            color: #4299ed;
            margin: 0;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .timeline-event {
            margin-bottom: 25px;
            padding: 15px;
            border-left: 4px solid #4299ed;
            background: #f9f9f9;
            border-radius: 0 8px 8px 0;
        }
        .event-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .event-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin: 0;
        }
        .event-meta {
            font-size: 12px;
            color: #666;
        }
        .event-type {
            background: #4299ed;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            text-transform: uppercase;
        }
        .priority-high { background: #f44336; }
        .priority-medium { background: #ff9800; }
        .priority-low { background: #4caf50; }
        .event-description {
            margin: 10px 0;
            line-height: 1.5;
        }
        .event-tags {
            margin-top: 10px;
        }
        .tag {
            background: #e3f2fd;
            color: #1976d2;
            padding: 2px 6px;
            border-radius: 8px;
            font-size: 11px;
            margin-right: 5px;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        @media print {
            body { margin: 0; }
            .timeline-event { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Medical Timeline Report</h1>
        <p><strong>Patient:</strong> ${patientName}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Total Events:</strong> ${events.length}</p>
    </div>
    
    ${sortedEvents.map(event => `
        <div class="timeline-event">
            <div class="event-header">
                <h3 class="event-title">${event.title}</h3>
                <div class="event-meta">
                    <span class="event-type priority-${event.priority}">${event.type.toUpperCase()}</span>
                    <span style="margin-left: 10px;">${this.formatDateForDisplay(event.date)}</span>
                </div>
            </div>
            <div class="event-description">${event.description}</div>
            ${event.tags.length > 0 ? `
                <div class="event-tags">
                    ${event.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `).join('')}
    
    <div class="footer">
        <p>This report was generated by Hospital Management System</p>
        <p>© ${new Date().getFullYear()} Hospital Management System. All rights reserved.</p>
    </div>
</body>
</html>`;
	}

	private downloadFile(content: string, filename: string, mimeType: string): void {
		const blob = new Blob([content], { type: mimeType });
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);
	}

	private printHTML(htmlContent: string): void {
		const printWindow = window.open('', '_blank');
		if (printWindow) {
			printWindow.document.write(htmlContent);
			printWindow.document.close();
			printWindow.focus();
			setTimeout(() => {
				printWindow.print();
				printWindow.close();
			}, 250);
		}
	}

	private formatDateForCSV(date: Date): string {
		return new Date(date).toISOString().split('T')[0];
	}

	private formatDateForDisplay(date: Date): string {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
}
