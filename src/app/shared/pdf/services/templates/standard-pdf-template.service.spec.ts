import { TestBed } from '@angular/core/testing';

import { StandardPdfTemplateService } from './standard-pdf-template.service';

describe('StandardPdfTemplateService', () => {
  let service: StandardPdfTemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StandardPdfTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
