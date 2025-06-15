import { NgModule } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TimelineModule } from 'primeng/timeline';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PanelModule } from 'primeng/panel';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChartModule } from 'primeng/chart';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { SidebarModule } from 'primeng/sidebar';
import { TabViewModule } from 'primeng/tabview';
import { AccordionModule } from 'primeng/accordion';

const PrimeNGModules = [
	CardModule,
	TimelineModule,
	ButtonModule,
	TableModule,
	InputTextModule,
	DropdownModule,
	CalendarModule,
	DialogModule,
	ToastModule,
	ConfirmDialogModule,
	PanelModule,
	ProgressBarModule,
	ChartModule,
	MenuModule,
	MenubarModule,
	SidebarModule,
	TabViewModule,
	AccordionModule
];

@NgModule({
	imports: PrimeNGModules,
	exports: PrimeNGModules
})
export class PrimeNGModule { }
