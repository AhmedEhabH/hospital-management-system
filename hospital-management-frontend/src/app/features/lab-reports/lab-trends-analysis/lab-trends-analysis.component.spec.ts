import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabTrendsAnalysisComponent } from './lab-trends-analysis.component';

describe('LabTrendsAnalysisComponent', () => {
  let component: LabTrendsAnalysisComponent;
  let fixture: ComponentFixture<LabTrendsAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LabTrendsAnalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabTrendsAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
