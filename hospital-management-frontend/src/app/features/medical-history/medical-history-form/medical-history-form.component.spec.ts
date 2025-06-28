import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalHistoryFormComponent } from './medical-history-form.component';

describe('MedicalHistoryFormComponent', () => {
  let component: MedicalHistoryFormComponent;
  let fixture: ComponentFixture<MedicalHistoryFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MedicalHistoryFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalHistoryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
