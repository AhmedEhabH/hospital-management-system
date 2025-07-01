import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalTimelineComponent } from './medical-timeline.component';

describe('MedicalTimelineComponent', () => {
  let component: MedicalTimelineComponent;
  let fixture: ComponentFixture<MedicalTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MedicalTimelineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
