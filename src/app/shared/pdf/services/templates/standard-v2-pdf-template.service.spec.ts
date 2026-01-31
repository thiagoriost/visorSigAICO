import { TestBed } from '@angular/core/testing';

import { StandardV2PdfTemplateService } from './standard-v2-pdf-template.service';

describe('StandardV2PdfTemplateService', () => {
  let service: StandardV2PdfTemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StandardV2PdfTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
