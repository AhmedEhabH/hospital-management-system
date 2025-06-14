import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalCardComponent } from './medical-card.component';

describe('MedicalCardComponent', () => {
  let component: MedicalCardComponent;
  let fixture: ComponentFixture<MedicalCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MedicalCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
