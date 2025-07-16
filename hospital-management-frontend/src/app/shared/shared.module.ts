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
import { RealTimeNotificationsComponent } from './components/real-time-notifications/real-time-notifications.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';


import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { MatStepperModule } from '@angular/material/stepper';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatOptionModule } from '@angular/material/core';
import { NavigationComponent } from './components/navigation/navigation.component';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';

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
		RealTimeNotificationsComponent,
		NavigationComponent,


	],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule,

		// BrowserAnimationsModule,
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
		MatProgressSpinnerModule,
		MatTabsModule,
		MatChipsModule,
		MatStepperModule,
		MatOptionModule,
		MatListModule,
		MatSelectModule,


		CalendarModule.forRoot({
			provide: DateAdapter,
			useFactory: adapterFactory,
		}),
	],
	exports: [
		// Export components
		ThemeToggleComponent,
		LogoutButtonComponent,

		CommonModule,
		// BrowserAnimationsModule,
		FormsModule,
		ReactiveFormsModule,

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
		RealTimeNotificationsComponent,
		MatProgressSpinnerModule,
		MatTabsModule,
		MatChipsModule,
		CalendarModule,
		MatStepperModule,
		MatOptionModule,
		MatListModule,
		MatSelectModule,
	],
})
export class SharedModule { }
