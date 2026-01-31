import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderLineaNegraStoreComponent } from './header-linea-negra-store.component';
import { StoreModule } from '@ngrx/store';
import { ContentTableDirectusSearchService } from '@app/core/services/content-table-directus-search/content-table-directus-search.service';

describe('HeaderLineaNegraStoreComponent', () => {
  let component: HeaderLineaNegraStoreComponent;
  let fixture: ComponentFixture<HeaderLineaNegraStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderLineaNegraStoreComponent, StoreModule.forRoot({})],
      providers: [ContentTableDirectusSearchService],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderLineaNegraStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
