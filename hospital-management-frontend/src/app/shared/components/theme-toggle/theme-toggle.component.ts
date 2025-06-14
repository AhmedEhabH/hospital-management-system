import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
	selector: 'app-theme-toggle',
	standalone: false,
	templateUrl: './theme-toggle.component.html',
	styleUrls: ['./theme-toggle.component.scss']
})
export class ThemeToggleComponent implements OnInit, OnDestroy {
	isDarkMode = false;
	private destroy$ = new Subject<void>();

	constructor(private themeService: ThemeService) { }

	ngOnInit(): void {
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

	toggleTheme(): void {
		this.themeService.toggleTheme();
	}
}
