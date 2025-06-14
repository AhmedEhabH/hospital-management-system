import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

// Components
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';

@NgModule({
	declarations: [
		ThemeToggleComponent
	],
	imports: [
		CommonModule,
		MatButtonModule,
		MatIconModule,
		MatSlideToggleModule,
		MatTooltipModule
	],
	exports: [
		ThemeToggleComponent,
		// Export Material modules for use in other modules
		MatButtonModule,
		MatIconModule,
		MatSlideToggleModule,
		MatTooltipModule
	]
})
export class SharedModule { }
