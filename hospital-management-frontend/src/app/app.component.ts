import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';
import { ThemeService } from './core/services/theme.service';
import { AuthService } from './core/services/auth.service';

@Component({
	selector: 'app-root',
	standalone: false,
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
	title = 'Hospital Management System';
	isDarkMode = false;
	showHeader = false;
	private destroy$ = new Subject<void>();

	constructor(
		private themeService: ThemeService,
		private authService: AuthService,
		private router: Router
	) { }

	ngOnInit(): void {
		this.subscribeToTheme();
		this.subscribeToAuth();
		this.subscribeToRouteChanges();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private subscribeToTheme(): void {
		this.themeService.isDarkMode$
			.pipe(takeUntil(this.destroy$))
			.subscribe(isDark => {
				this.isDarkMode = isDark;
			});
	}

	private subscribeToAuth(): void {
		this.authService.currentUser$
			.pipe(takeUntil(this.destroy$))
			.subscribe(user => {
				this.updateHeaderVisibility();
			});
	}

	private subscribeToRouteChanges(): void {
		this.router.events
			.pipe(
				filter(event => event instanceof NavigationEnd),
				takeUntil(this.destroy$)
			)
			.subscribe(() => {
				this.updateHeaderVisibility();
			});
	}

	private updateHeaderVisibility(): void {
		const currentRoute = this.router.url;
		const isAuthRoute = currentRoute.includes('/auth/');
		const isAuthenticated = this.authService.isAuthenticated();

		this.showHeader = isAuthenticated && !isAuthRoute;
	}
}
