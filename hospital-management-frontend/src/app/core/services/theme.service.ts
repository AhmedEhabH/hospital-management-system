import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class ThemeService {
	private isDarkModeSubject = new BehaviorSubject<boolean>(false);
	public isDarkMode$ = this.isDarkModeSubject.asObservable();

	constructor() {
		this.initializeTheme();
	}

	private initializeTheme(): void {
		// Check for saved theme preference or default to system preference
		const savedTheme = localStorage.getItem('darkMode');
		let isDark = false;

		if (savedTheme !== null) {
			// Use saved preference
			isDark = JSON.parse(savedTheme);
		} else {
			// Use system preference
			isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		}

		this.setTheme(isDark);

		// Listen for system theme changes
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
			// Only apply system preference if no manual preference is saved
			if (localStorage.getItem('darkMode') === null) {
				this.setTheme(e.matches);
			}
		});
	}

	toggleTheme(): void {
		const newTheme = !this.isDarkModeSubject.value;
		this.setTheme(newTheme);
		localStorage.setItem('darkMode', newTheme.toString());
	}

	setTheme(isDark: boolean): void {
		this.isDarkModeSubject.next(isDark);
		this.applyTheme(isDark);
	}

	private applyTheme(isDark: boolean): void {
		const body = document.body;
		const htmlElement = document.documentElement;

		// Remove existing theme classes
		body.classList.remove('light-theme', 'dark-theme');
		htmlElement.classList.remove('light-theme', 'dark-theme');

		if (isDark) {
			body.classList.add('dark-theme');
			htmlElement.classList.add('dark-theme');
		} else {
			body.classList.add('light-theme');
			htmlElement.classList.add('light-theme');
		}

		// Update meta theme-color for mobile browsers
		this.updateMetaThemeColor(isDark);
	}

	private updateMetaThemeColor(isDark: boolean): void {
		const metaThemeColor = document.querySelector('meta[name="theme-color"]');
		const color = isDark ? '#121212' : '#2196f3';

		if (metaThemeColor) {
			metaThemeColor.setAttribute('content', color);
		} else {
			const meta = document.createElement('meta');
			meta.name = 'theme-color';
			meta.content = color;
			document.head.appendChild(meta);
		}
	}

	getCurrentTheme(): boolean {
		return this.isDarkModeSubject.value;
	}

	// Method to reset to system preference
	resetToSystemPreference(): void {
		localStorage.removeItem('darkMode');
		const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		this.setTheme(systemPrefersDark);
	}
}
