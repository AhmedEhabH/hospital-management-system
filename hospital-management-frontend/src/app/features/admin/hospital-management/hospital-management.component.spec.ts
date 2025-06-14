import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalManagementComponent } from './hospital-management.component';

describe('HospitalManagementComponent', () => {
  let component: HospitalManagementComponent;
  let fixture: ComponentFixture<HospitalManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HospitalManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
