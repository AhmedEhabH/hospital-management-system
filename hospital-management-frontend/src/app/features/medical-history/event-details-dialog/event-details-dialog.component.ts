import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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

@Component({
  selector: 'app-event-details-dialog',
  standalone:false,
  templateUrl: './event-details-dialog.component.html',
  styleUrls: ['./event-details-dialog.component.scss']
})
export class EventDetailsDialogComponent {
  
  constructor(
    public dialogRef: MatDialogRef<EventDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public event: TimelineEvent
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  onEdit(): void {
    this.dialogRef.close('edit');
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority}`;
  }

  getEventTypeClass(type: string): string {
    return `event-type-${type}`;
  }
}
