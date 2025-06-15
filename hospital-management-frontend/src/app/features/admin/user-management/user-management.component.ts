import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

interface User {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	userType: string;
	isActive: boolean;
	lastLogin: Date;
	createdAt: Date;
}

@Component({
	selector: 'app-user-management',
	standalone: false,
	templateUrl: './user-management.component.html',
	styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit, OnDestroy {
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;

	private destroy$ = new Subject<void>();

	currentUser: any;
	isDarkMode = false;
	isLoading = true;

	// User Data
	users: User[] = [];
	dataSource = new MatTableDataSource<User>();
	displayedColumns: string[] = ['name', 'email', 'userType', 'status', 'lastLogin', 'actions'];

	// Filters
	selectedUserType = 'All';
	selectedStatus = 'All';
	userTypes = ['All', 'Admin', 'Doctor', 'Patient'];
	statusOptions = ['All', 'Active', 'Inactive'];

	constructor(
		private authService: AuthService,
		private themeService: ThemeService,
		private dialog: MatDialog,
		private snackBar: MatSnackBar
	) { }

	ngOnInit(): void {
		this.initializeComponent();
		this.subscribeToTheme();
		this.loadUsers();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private initializeComponent(): void {
		this.currentUser = this.authService.getCurrentUser();
	}

	private subscribeToTheme(): void {
		this.themeService.isDarkMode$
			.pipe(takeUntil(this.destroy$))
			.subscribe(isDark => {
				this.isDarkMode = isDark;
			});
	}

	private loadUsers(): void {
		this.isLoading = true;

		// Mock user data - replace with actual API call
		setTimeout(() => {
			this.users = [
				{
					id: 1,
					firstName: 'John',
					lastName: 'Doe',
					email: 'john.doe@hospital.com',
					userType: 'Patient',
					isActive: true,
					lastLogin: new Date('2024-12-15T10:30:00'),
					createdAt: new Date('2024-01-15T09:00:00')
				},
				{
					id: 2,
					firstName: 'Dr. Sarah',
					lastName: 'Smith',
					email: 'sarah.smith@hospital.com',
					userType: 'Doctor',
					isActive: true,
					lastLogin: new Date('2024-12-15T08:15:00'),
					createdAt: new Date('2023-06-10T14:30:00')
				},
				{
					id: 3,
					firstName: 'Admin',
					lastName: 'User',
					email: 'admin@hospital.com',
					userType: 'Admin',
					isActive: true,
					lastLogin: new Date('2024-12-15T07:45:00'),
					createdAt: new Date('2023-01-01T00:00:00')
				}
			];

			this.dataSource.data = this.users;
			this.isLoading = false;

			// Set up pagination and sorting
			setTimeout(() => {
				if (this.paginator) {
					this.dataSource.paginator = this.paginator;
				}
				if (this.sort) {
					this.dataSource.sort = this.sort;
				}
			});
		}, 1000);
	}

	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();

		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}

	filterByUserType(): void {
		this.applyFilters();
	}

	filterByStatus(): void {
		this.applyFilters();
	}

	private applyFilters(): void {
		let filteredData = [...this.users];

		if (this.selectedUserType !== 'All') {
			filteredData = filteredData.filter(user => user.userType === this.selectedUserType);
		}

		if (this.selectedStatus !== 'All') {
			const isActive = this.selectedStatus === 'Active';
			filteredData = filteredData.filter(user => user.isActive === isActive);
		}

		this.dataSource.data = filteredData;
	}

	getUserTypeClass(userType: string): string {
		switch (userType.toLowerCase()) {
			case 'admin': return 'user-admin';
			case 'doctor': return 'user-doctor';
			case 'patient': return 'user-patient';
			default: return 'user-patient';
		}
	}

	getStatusClass(isActive: boolean): string {
		return isActive ? 'status-stable' : 'status-critical';
	}

	editUser(user: User): void {
		console.log('Edit user:', user);
		// Open edit user dialog
	}

	toggleUserStatus(user: User): void {
		user.isActive = !user.isActive;
		const action = user.isActive ? 'activated' : 'deactivated';

		this.snackBar.open(`User ${action} successfully`, 'Close', {
			duration: 3000,
			panelClass: ['success-snackbar']
		});
	}

	deleteUser(user: User): void {
		if (confirm(`Are you sure you want to delete user ${user.firstName} ${user.lastName}?`)) {
			const index = this.users.findIndex(u => u.id === user.id);
			if (index > -1) {
				this.users.splice(index, 1);
				this.dataSource.data = [...this.users];

				this.snackBar.open('User deleted successfully', 'Close', {
					duration: 3000,
					panelClass: ['success-snackbar']
				});
			}
		}
	}

	addNewUser(): void {
		console.log('Add new user');
		// Open add user dialog
	}

	exportUsers(): void {
		console.log('Export users');
		// Implement CSV/Excel export
	}
}
