import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// Core imports
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardHeaderComponent } from './shared/components/dashboard-header/dashboard-header.component';
import { DashboardSidebarComponent } from './shared/components/dashboard-sidebar/dashboard-sidebar.component';
import { MedicalCardComponent } from './shared/components/medical-card/medical-card.component';
import { StatsWidgetComponent } from './shared/components/stats-widget/stats-widget.component';

import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ThemeToggleComponent } from './shared/components/theme-toggle/theme-toggle.component';

@NgModule({
	declarations: [
		AppComponent,
		DashboardHeaderComponent,
		DashboardSidebarComponent,
		MedicalCardComponent,
		StatsWidgetComponent,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		HttpClientModule
	],
	providers: [
		{
			provide: HTTP_INTERCEPTORS,
			useClass: AuthInterceptor,
			multi: true
		},
		provideCharts(withDefaultRegisterables()),
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
