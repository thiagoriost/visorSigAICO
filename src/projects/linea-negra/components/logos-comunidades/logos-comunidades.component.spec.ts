import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogosComunidadesComponent } from './logos-comunidades.component';
import { ContentTableDirectusSearchService } from '@app/core/services/content-table-directus-search/content-table-directus-search.service';

describe('LogosComunidadesComponent', () => {
  let component: LogosComunidadesComponent;
  let fixture: ComponentFixture<LogosComunidadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogosComunidadesComponent],
      providers: [ContentTableDirectusSearchService],
    }).compileComponents();

    fixture = TestBed.createComponent(LogosComunidadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
