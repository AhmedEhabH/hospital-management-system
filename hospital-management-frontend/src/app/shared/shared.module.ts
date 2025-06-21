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
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { RealTimeAlertsComponent } from './components/real-time-alerts/real-time-alerts.component';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PageNotFoundModule } from './components/page-not-found/page-not-found.module';

@NgModule({
	declarations: [
		ThemeToggleComponent,
		HeaderComponent,
		SidebarComponent,
		LoadingComponent,
		FooterComponent,
		LogoutButtonComponent,
		UnauthorizedComponent,
		RealTimeAlertsComponent,
		
	],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule,

		// Angular Material Modules
		MatToolbarModule,
		MatButtonModule,
		MatIconModule,
		MatMenuModule,
		MatFormFieldModule,
		MatInputModule,
		MatBadgeModule,
		MatTooltipModule,
		MatSnackBarModule,
		MatDividerModule,
		MatProgressBarModule,
		PageNotFoundModule,
	],
	exports: [
		// Export components
		ThemeToggleComponent,
		LogoutButtonComponent,

		HeaderComponent,
		SidebarComponent,
		FooterComponent,
		LoadingComponent,
		RealTimeAlertsComponent,

		// Angular Material Modules
		MatToolbarModule,
		MatButtonModule,
		MatIconModule,
		MatMenuModule,
		MatFormFieldModule,
		MatInputModule,
		MatBadgeModule,
		MatTooltipModule,
		MatSnackBarModule,
		MatDividerModule,
		MatProgressBarModule,
		PageNotFoundModule,
	]
})
export class SharedModule { }
