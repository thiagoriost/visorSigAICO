import { TestBed } from '@angular/core/testing';
import { UserPreferencesLoaderService } from './user-preferences-loader.service';
import { Store, StoreModule } from '@ngrx/store';
import { AppThemeService } from '../app-theme/app-theme.service';
import { ContentTableSearchService } from '../content-table-search/content-table-search.service';
import { ContentTableDirectusSearchService } from '@app/core/services/content-table-directus-search/content-table-directus-search.service';
import { MessageService } from 'primeng/api';
import { AuthState } from '@app/core/interfaces/auth/AuthStateInterface';
import { provideMockStore } from '@ngrx/store/testing';

describe('UserPreferencesLoaderService', () => {
  let service: UserPreferencesLoaderService;
  let storeSpy: jasmine.SpyObj<Store<AuthState>>;

  beforeEach(() => {
    storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'select', 'pipe'], {
      user: {},
    });
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({})],
      providers: [
        { provide: Store<AuthState>, useValue: storeSpy },
        provideMockStore({
          initialState: {
            auth: {
              user: null,
            },
          }, // tu estado inicial
        }),
        AppThemeService,
        ContentTableSearchService,
        ContentTableDirectusSearchService,
        MessageService,
      ],
    });
    service = TestBed.inject(UserPreferencesLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
