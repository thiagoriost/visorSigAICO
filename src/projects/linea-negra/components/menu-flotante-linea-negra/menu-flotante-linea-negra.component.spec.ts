import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuFlotanteLineaNegraComponent } from './menu-flotante-linea-negra.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { UserInterfaceState } from '@app/core/interfaces/store/user-interface.model';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { SetSingleComponentWidget } from '@app/core/store/user-interface/user-interface.actions';

describe('MenuFlotanteLineaNegraComponent', () => {
  let component: MenuFlotanteLineaNegraComponent;
  let fixture: ComponentFixture<MenuFlotanteLineaNegraComponent>;
  let store: MockStore<{ userInterface: UserInterfaceState }>;
  let dispatchSpy: jasmine.Spy;
  let appConfigServiceMock: jasmine.SpyObj<AppConfigService>;

  beforeEach(async () => {
    appConfigServiceMock = jasmine.createSpyObj('AppConfigService', ['get']);
    await TestBed.configureTestingModule({
      imports: [MenuFlotanteLineaNegraComponent],
      providers: [
        provideMockStore({}),
        { provide: AppConfigService, useValue: appConfigServiceMock },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(MenuFlotanteLineaNegraComponent);
    component = fixture.componentInstance;
    dispatchSpy = spyOn(store, 'dispatch');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.menuOpciones.length).toBeGreaterThan(0);
  });

  it('Deberia disparar SetSingleComponentWidget para los demas opcionId', () => {
    component.onSeleccion({ botonId: '1', opcionId: 'Leyenda' });
    expect(dispatchSpy).toHaveBeenCalledWith(
      SetSingleComponentWidget({ nombre: 'Leyenda' })
    );
  });
});
