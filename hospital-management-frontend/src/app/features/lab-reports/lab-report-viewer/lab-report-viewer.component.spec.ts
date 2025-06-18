import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabReportViewerComponent } from './lab-report-viewer.component';

describe('LabReportViewerComponent', () => {
  let component: LabReportViewerComponent;
  let fixture: ComponentFixture<LabReportViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LabReportViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabReportViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
