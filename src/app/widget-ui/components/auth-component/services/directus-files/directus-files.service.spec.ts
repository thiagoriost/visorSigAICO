import { TestBed } from '@angular/core/testing';

import { DirectusFilesService } from './directus-files.service';

describe('DirectusFilesService', () => {
  let service: DirectusFilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DirectusFilesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
