import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientOutcomesComponent } from './patient-outcomes.component';

describe('PatientOutcomesComponent', () => {
  let component: PatientOutcomesComponent;
  let fixture: ComponentFixture<PatientOutcomesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PatientOutcomesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientOutcomesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
