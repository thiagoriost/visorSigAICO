import { TestBed } from '@angular/core/testing';

import { StandardV4PdfTemplateService } from './standard-v4-pdf-template.service';

describe('StandardV4PdfTemplateService', () => {
  let service: StandardV4PdfTemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StandardV4PdfTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
