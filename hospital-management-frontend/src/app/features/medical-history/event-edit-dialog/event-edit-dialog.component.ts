import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
	selector: 'app-event-edit-dialog',
	standalone:false,
	templateUrl: './event-edit-dialog.component.html',
	styleUrls: ['./event-edit-dialog.component.scss']
})
export class EventEditDialogComponent implements OnInit {
	editForm: FormGroup;

	eventTypes = [
		{ value: 'medical', label: 'Medical Record', icon: 'medical_services' },
		{ value: 'appointment', label: 'Appointment', icon: 'event' },
		{ value: 'medication', label: 'Medication', icon: 'medication' },
		{ value: 'test', label: 'Lab Test', icon: 'science' },
		{ value: 'surgery', label: 'Surgery', icon: 'healing' },
		{ value: 'emergency', label: 'Emergency', icon: 'emergency' }
	];

	priorityLevels = [
		{ value: 'high', label: 'High Priority' },
		{ value: 'medium', label: 'Medium Priority' },
		{ value: 'low', label: 'Low Priority' }
	];

	constructor(
		private fb: FormBuilder,
		public dialogRef: MatDialogRef<EventEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public event: TimelineEvent
	) {
		this.editForm = this.fb.group({
			title: [event.title, [Validators.required, Validators.minLength(3)]],
			description: [event.description, [Validators.required, Validators.minLength(10)]],
			date: [event.date, Validators.required],
			type: [event.type, Validators.required],
			priority: [event.priority, Validators.required],
			tags: [event.tags.join(', ')]
		});
	}

	ngOnInit(): void { }

	onSave(): void {
		if (this.editForm.valid) {
			const formValue = this.editForm.value;
			const updatedEvent: TimelineEvent = {
				...this.event,
				title: formValue.title,
				description: formValue.description,
				date: formValue.date,
				type: formValue.type,
				priority: formValue.priority,
				tags: formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()) : []
			};

			this.dialogRef.close(updatedEvent);
		}
	}

	onCancel(): void {
		this.dialogRef.close();
	}

	getFieldError(fieldName: string): string {
		const field = this.editForm.get(fieldName);
		if (field?.errors && field.touched) {
			if (field.errors['required']) {
				return `${this.getFieldDisplayName(fieldName)} is required`;
			}
			if (field.errors['minlength']) {
				return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
			}
		}
		return '';
	}

	private getFieldDisplayName(fieldName: string): string {
		const displayNames: { [key: string]: string } = {
			title: 'Title',
			description: 'Description',
			date: 'Date',
			type: 'Event Type',
			priority: 'Priority',
			tags: 'Tags'
		};
		return displayNames[fieldName] || fieldName;
	}
}
