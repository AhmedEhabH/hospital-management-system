import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealTimeAlertsComponent } from './real-time-alerts.component';

describe('RealTimeAlertsComponent', () => {
  let component: RealTimeAlertsComponent;
  let fixture: ComponentFixture<RealTimeAlertsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RealTimeAlertsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealTimeAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
