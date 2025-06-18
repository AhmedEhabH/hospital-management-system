import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabReportFormComponent } from './lab-report-form.component';

describe('LabReportFormComponent', () => {
  let component: LabReportFormComponent;
  let fixture: ComponentFixture<LabReportFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LabReportFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabReportFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
