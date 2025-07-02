import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MessageService } from '../../../core/services/message.service';
import { AuthService } from '../../../core/services/auth.service';
import { MessageDto } from '../../../core/models/message.model';

@Component({
	selector: 'app-inbox',
	standalone: false,
	templateUrl: './inbox.component.html',
	styleUrls: ['./inbox.component.scss']
})
export class InboxComponent implements OnInit {
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;

	dataSource = new MatTableDataSource<MessageDto>();
	displayedColumns: string[] = ['subject', 'sender', 'sentDate', 'priority', 'status', 'actions'];
	isLoading = true;
	currentUser: any = null;

	constructor(
		private messageService: MessageService,
		private authService: AuthService,
		private router: Router
	) { }

	ngOnInit(): void {
		this.currentUser = this.authService.getCurrentUser();
		this.loadMessages();
	}

	private loadMessages(): void {
		if (!this.currentUser) return;

		this.isLoading = true;
		this.messageService.getInbox(this.currentUser.id)
			.subscribe({
				next: (data) => {
					this.dataSource.data = data;
					this.dataSource.paginator = this.paginator;
					this.dataSource.sort = this.sort;
					this.isLoading = false;
				},
				error: (error) => {
					console.error('Error loading messages:', error);
					this.isLoading = false;
				}
			});
	}

	public composeMessage(): void {
		this.router.navigate(['/messaging/compose']);
	}

	public viewMessage(messageId: number): void {
		this.router.navigate(['/messaging/view', messageId]);
	}

	public replyToMessage(messageId: number): void {
		this.router.navigate(['/messaging/compose'], {
			queryParams: { replyTo: messageId }
		});
	}

	public applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();
	}

	public getMessageStatusClass(message: MessageDto): string {
		return message.isRead ? 'status-stable' : 'status-info';
	}

	public getPriorityClass(priority: string): string {
		switch (priority?.toLowerCase()) {
			case 'high': return 'priority-high';
			case 'medium': return 'priority-medium';
			case 'low': return 'priority-low';
			default: return 'priority-medium';
		}
	}
}
