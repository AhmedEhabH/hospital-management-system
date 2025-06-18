import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
	selector: 'app-header',
	standalone: false,
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	currentUser: any = null;
	isDarkMode = false;

	constructor(
		private authService: AuthService,
		private themeService: ThemeService
	) { }

	ngOnInit(): void {
		this.authService.currentUser$
			.pipe(takeUntil(this.destroy$))
			.subscribe(user => {
				this.currentUser = user;
			});

		// Subscribe to theme changes - CRITICAL FOR DARK MODE
		this.themeService.isDarkMode$
			.pipe(takeUntil(this.destroy$))
			.subscribe(isDark => {
				this.isDarkMode = isDark;
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
