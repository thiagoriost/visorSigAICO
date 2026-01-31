import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutenticacionLineaNegraComponent } from './autenticacion-linea-negra.component';
import { AppThemeService } from '@projects/linea-negra/services/app-theme/app-theme.service';
import { StoreModule } from '@ngrx/store';
import { MessageService } from 'primeng/api';
import { ContentTableSearchService } from '@projects/linea-negra/services/content-table-search/content-table-search.service';
import { ContentTableDirectusSearchService } from '@app/core/services/content-table-directus-search/content-table-directus-search.service';

describe('AutenticacionLineaNegraComponent', () => {
  let component: AutenticacionLineaNegraComponent;
  let fixture: ComponentFixture<AutenticacionLineaNegraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutenticacionLineaNegraComponent, StoreModule.forRoot({})],
      providers: [
        AppThemeService,
        MessageService,
        ContentTableSearchService,
        ContentTableDirectusSearchService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AutenticacionLineaNegraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
