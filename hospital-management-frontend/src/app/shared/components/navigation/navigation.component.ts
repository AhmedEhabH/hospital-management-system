import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { CurrentUserDto } from '../../../core/models';

@Component({
	selector: 'app-navigation',
	standalone: false,
	templateUrl: './navigation.component.html',
	styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {
	currentUser: CurrentUserDto | null = null;
	isDarkMode = false;
	isMenuOpen = false;

	private destroy$ = new Subject<void>();

	constructor(
		private authService: AuthService,
		private themeService: ThemeService,
		private router: Router
	) { }

	ngOnInit(): void {
		this.initializeUser();
		this.subscribeToTheme();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private initializeUser(): void {
		this.currentUser = this.authService.getCurrentUser();
	}

	private subscribeToTheme(): void {
		this.themeService.isDarkMode$
			.pipe(takeUntil(this.destroy$))
			.subscribe(isDark => {
				this.isDarkMode = isDark;
			});
	}

	public toggleMenu(): void {
		this.isMenuOpen = !this.isMenuOpen;
	}

	public closeMenu(): void {
		this.isMenuOpen = false;
	}

	public navigateTo(route: string): void {
		this.router.navigate([route]);
		this.closeMenu();
	}

	public logout(): void {
		this.authService.logout();
		this.router.navigate(['/auth/login']);
	}

	public toggleTheme(): void {
		this.themeService.toggleTheme();
	}

	public getUserDisplayName(): string {
		if (!this.currentUser) return 'Guest';
		return this.currentUser.displayName ||
			`${this.currentUser.firstName} ${this.currentUser.lastName}` ||
			this.currentUser.userId;
	}

	public getUserRole(): string {
		return this.currentUser?.userType || 'Guest';
	}

	public hasPermission(permission: string): boolean {
		return this.currentUser?.permissions?.includes(permission) || false;
	}

	public canAccess(userTypes: string[]): boolean {
		return this.currentUser ? userTypes.includes(this.currentUser.userType) : false;
	}
}
