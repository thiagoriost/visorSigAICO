import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { UserInterfaceService } from './user-interface.service';
import {
  initialUserInterfaceWidgetStatus,
  AbrirWidget,
} from '@app/core/store/user-interface/user-interface.actions';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import {
  IWidgetConfig,
  WIDGET_CONFIG,
} from '@app/core/config/interfaces/IWidgetConfig';
import { Type } from '@angular/core';

/**
 * @description Pruebas unitarias del servicio UserInterfaceService.
 * @author Carlos Javier Muñoz Fernández
 * @date 05/12/2024
 * @class user-interface.service.spec.ts
 */

describe('UserInterfaceService', () => {
  let service: UserInterfaceService;
  let store: MockStore;
  const initialState = {
    userInterface: {
      widgets: [
        {
          nombreWidget: 'BaseMap',
          ruta: '@app/widget/baseMap/Components/base-map/base-map.component',
          posicion: '1,3',
          titulo: 'Mapa Base',
          importarComponente: () =>
            import(
              '@app/widget/baseMap/Components/base-map/base-map.component'
            ).then(m => m.BaseMapComponent),
        },
        {
          nombreWidget: 'ContentTable',
          ruta: '@app/widget/content-table/components/content-table/content-table.component.ts',
          posicion: '1,4',
          titulo: 'Tabla de Contenido',
          importarComponente: () =>
            import(
              '@app/widget/content-table/components/content-table/content-table.component'
            ).then(m => m.ContentTableComponent),
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({})],
      providers: [
        UserInterfaceService,
        provideMockStore({ initialState }),
        { provide: WIDGET_CONFIG, useValue: mockConfig },
      ],
    });
    store = TestBed.inject(Store) as MockStore;
    service = TestBed.inject(UserInterfaceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should dispatch initialUserInterfaceWidgetStatus action on creation', () => {
    const dispatchSpy = spyOn(store, 'dispatch');
    service = new UserInterfaceService(store, mockConfig); // Crear una nueva instancia del servicio
    expect(dispatchSpy).toHaveBeenCalledWith(
      initialUserInterfaceWidgetStatus({
        initialUserInterfaceWidgetStatus: service.widgetsConfig,
      })
    );
  });

  // it('should return the correct component for a given widget name', async () => {
  //   const component = await service.getComponente('HolaMundoComponent');
  //   expect(component).toBeTruthy();
  // });

  it('should return null if the widget name does not exist', async () => {
    const component = await service.getComponente('NonExistentComponent');
    expect(component).toBeNull();
  });

  it('should dispatch AbrirWidget action when cambiarVisibleWidget is called', () => {
    const dispatchSpy = spyOn(store, 'dispatch');
    service.cambiarVisibleWidget('HolaMundoComponent', true);
    expect(dispatchSpy).toHaveBeenCalledWith(
      AbrirWidget({ nombre: 'HolaMundoComponent', estado: true })
    );
  });
});
