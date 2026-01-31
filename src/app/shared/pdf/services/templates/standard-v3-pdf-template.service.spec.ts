import { TestBed } from '@angular/core/testing';

import { StandardV3PdfTemplateService } from './standard-v3-pdf-template.service';

describe('StandardV3PdfTemplateService', () => {
  let service: StandardV3PdfTemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StandardV3PdfTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
