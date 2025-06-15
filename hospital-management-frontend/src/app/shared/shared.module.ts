import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Angular Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Components
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LoadingComponent } from './components/loading/loading.component';
import { FooterComponent } from './components/footer/footer.component';
import { LogoutButtonComponent } from './components/logout-button/logout-button.component';

@NgModule({
	declarations: [
		ThemeToggleComponent,
		HeaderComponent,
		SidebarComponent,
		LoadingComponent,
		FooterComponent,
		LogoutButtonComponent
	],
	imports: [
		CommonModule,
		RouterModule,
		MatButtonModule,
		MatIconModule,
		MatSlideToggleModule,
		MatTooltipModule,
		MatProgressBarModule,
		MatSnackBarModule
	],
	exports: [
		// Export components
		ThemeToggleComponent,
		LogoutButtonComponent,
		HeaderComponent,
		SidebarComponent,
		LoadingComponent,
		FooterComponent,
		// Export Material modules for use in other modules
		MatButtonModule,
		MatIconModule,
		MatSlideToggleModule,
		MatTooltipModule,
		MatProgressBarModule,
		MatSnackBarModule
	]
})
export class SharedModule { }
