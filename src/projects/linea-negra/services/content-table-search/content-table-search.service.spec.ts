import { TestBed } from '@angular/core/testing';

import { ContentTableSearchService } from './content-table-search.service';
import { StoreModule } from '@ngrx/store';
import { ContentTableDirectusSearchService } from '@app/core/services/content-table-directus-search/content-table-directus-search.service';
import { MessageService } from 'primeng/api';

describe('ContentTableSearchService', () => {
  let service: ContentTableSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot()],
      providers: [ContentTableDirectusSearchService, MessageService],
    });
    service = TestBed.inject(ContentTableSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
