import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabComparisonComponent } from './lab-comparison.component';

describe('LabComparisonComponent', () => {
  let component: LabComparisonComponent;
  let fixture: ComponentFixture<LabComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LabComparisonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
