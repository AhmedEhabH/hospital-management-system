import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealTimeNotificationsComponent } from './real-time-notifications.component';

describe('RealTimeNotificationsComponent', () => {
  let component: RealTimeNotificationsComponent;
  let fixture: ComponentFixture<RealTimeNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RealTimeNotificationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealTimeNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
