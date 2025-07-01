import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalHistoryListComponent } from './medical-history-list.component';

describe('MedicalHistoryListComponent', () => {
  let component: MedicalHistoryListComponent;
  let fixture: ComponentFixture<MedicalHistoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MedicalHistoryListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalHistoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
