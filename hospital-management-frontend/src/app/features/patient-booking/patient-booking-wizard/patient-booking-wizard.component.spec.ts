import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientBookingWizardComponent } from './patient-booking-wizard.component';

describe('PatientBookingWizardComponent', () => {
  let component: PatientBookingWizardComponent;
  let fixture: ComponentFixture<PatientBookingWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PatientBookingWizardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientBookingWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
