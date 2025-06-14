import { TestBed } from '@angular/core/testing';

import { LabReportService } from './lab-report.service';

describe('LabReportService', () => {
  let service: LabReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LabReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
