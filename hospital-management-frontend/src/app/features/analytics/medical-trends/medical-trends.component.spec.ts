import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalTrendsComponent } from './medical-trends.component';

describe('MedicalTrendsComponent', () => {
  let component: MedicalTrendsComponent;
  let fixture: ComponentFixture<MedicalTrendsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MedicalTrendsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalTrendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
