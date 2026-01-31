import { TestBed } from '@angular/core/testing';

import { ContentTableDirectusSearchService } from './content-table-directus-search.service';

describe('ContentTableDirectusSearchService', () => {
  let service: ContentTableDirectusSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContentTableDirectusSearchService],
    });
    service = TestBed.inject(ContentTableDirectusSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
