import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportOptionsDialogComponent } from './export-options-dialog.component';

describe('ExportOptionsDialogComponent', () => {
  let component: ExportOptionsDialogComponent;
  let fixture: ComponentFixture<ExportOptionsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExportOptionsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportOptionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
