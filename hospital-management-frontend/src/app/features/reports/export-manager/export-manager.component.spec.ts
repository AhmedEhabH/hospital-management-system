import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportManagerComponent } from './export-manager.component';

describe('ExportManagerComponent', () => {
  let component: ExportManagerComponent;
  let fixture: ComponentFixture<ExportManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExportManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
