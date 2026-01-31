import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PanelComponent } from './panel.component';
import { UserInterfaceService } from '@app/core/services/user-interface-service/user-interface.service';
import { Store, StoreModule } from '@ngrx/store';
import { UserInterfaceState } from '@app/core/interfaces/store/user-interface.model';
import { selectWidgetOpened } from '@app/core/store/user-interface/user-interface.selectors';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Type } from '@angular/core';
import {
  IWidgetConfig,
  WIDGET_CONFIG,
} from '@app/core/config/interfaces/IWidgetConfig';

/**
 * @description Pruebas unitarias del componente.
 * @author Carlos Javier Muñoz Fernández
 * @date 05/12/2024
 * @class panel.component.spec.ts
 */
describe('PanelComponent', () => {
  let component: PanelComponent;
  let fixture: ComponentFixture<PanelComponent>;
  let store: MockStore<{ userInterface: UserInterfaceState }>;
  const initialState = {
    userInterface: {
      widgets: [
        {
          titulo: 'Titulo hola mundo',
          nombreWidget: 'HolaMundoComponent',
          ruta: '@app/widget/holamundo/hola-mundo/hola-mundo.component',
          posicionX: 1,
          posiciony: 1,
          abierto: true,
          importarComponente: () => Promise.resolve({} as Type<unknown>),
        },
      ],
    },
  };

  const mockConfig: IWidgetConfig = {
    widgetsConfig: [
      {
        nombreWidget: 'BaseMap',
        titulo: 'Mapa Base',
        ruta: 'mock/ruta',
        importarComponente: (): Promise<Type<unknown>> =>
          Promise.resolve(
            class MockBaseMapComponent {} as unknown as Type<unknown>
          ),
      },
    ],
    overlayWidgetsConfig: [
      {
        nombreWidget: 'Overlay1',
        titulo: 'Overlay 1',
        ruta: 'mock/ruta',
        importarComponente: (): Promise<Type<unknown>> =>
          Promise.resolve(
            class MockOverlayComponent {} as unknown as Type<unknown>
          ),
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelComponent, StoreModule.forRoot({})],
      providers: [
        UserInterfaceService,
        provideMockStore({ initialState }),
        { provide: WIDGET_CONFIG, useValue: mockConfig },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PanelComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store) as MockStore<{
      userInterface: UserInterfaceState;
    }>;
    store.overrideSelector(
      selectWidgetOpened,
      initialState.userInterface.widgets
    );
    fixture.detectChanges();
  });

  /**
   * Verifica que el componente se crea correctamente.
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Verifica que `widgetsAbiertos$` selecciona correctamente los widgets abiertos desde el store.
   */
  it('should select widgetsAbiertos$ from the store', () => {
    component.widgetsAbiertos$.subscribe(widgets => {
      expect(widgets.length).toBe(1);
      expect(widgets[0].nombreWidget).toBe('HolaMundoComponent');
    });
  });
});
