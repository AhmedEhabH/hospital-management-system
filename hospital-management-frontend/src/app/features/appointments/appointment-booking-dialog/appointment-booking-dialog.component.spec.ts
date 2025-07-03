import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentBookingDialogComponent } from './appointment-booking-dialog.component';

describe('AppointmentBookingDialogComponent', () => {
  let component: AppointmentBookingDialogComponent;
  let fixture: ComponentFixture<AppointmentBookingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppointmentBookingDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentBookingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
