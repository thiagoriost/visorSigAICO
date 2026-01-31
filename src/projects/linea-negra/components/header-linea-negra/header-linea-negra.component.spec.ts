import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderLineaNegraComponent } from './header-linea-negra.component';
import { ContentTableDirectusSearchService } from '@app/core/services/content-table-directus-search/content-table-directus-search.service';

describe('HeaderLineaNegraComponent', () => {
  let component: HeaderLineaNegraComponent;
  let fixture: ComponentFixture<HeaderLineaNegraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderLineaNegraComponent],
      providers: [ContentTableDirectusSearchService],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderLineaNegraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
