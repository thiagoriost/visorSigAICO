import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IndexPageComponent } from './index-page.component';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { of } from 'rxjs';
import { StoreModule } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import {
  IWidgetConfig,
  WIDGET_CONFIG,
} from '@app/core/config/interfaces/IWidgetConfig';
import { Type } from '@angular/core';
import { MessageService } from 'primeng/api';

describe('IndexPageComponent', () => {
  let component: IndexPageComponent;
  let fixture: ComponentFixture<IndexPageComponent>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
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
    // Crear un spy para BreakpointObserver
    breakpointObserverSpy = jasmine.createSpyObj<BreakpointObserver>(
      'BreakpointObserver',
      ['observe']
    );

    await TestBed.configureTestingModule({
      imports: [IndexPageComponent, StoreModule.forRoot({}, {})],
      providers: [
        provideMockStore(),
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: WIDGET_CONFIG, useValue: mockConfig },
        MessageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IndexPageComponent);
    component = fixture.componentInstance;
  });

  it(' Debería crearse el componente. ', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('Debería suscribirse a BreakpointObserver y establecer isSmallScreen en true para pantallas pequeñas.', () => {
      // Simular que el breakpointObserver devuelve un estado de pantalla pequeña
      const mockState: BreakpointState = {
        matches: true,
        breakpoints: { [Breakpoints.XSmall]: true, [Breakpoints.Small]: true },
      };
      breakpointObserverSpy.observe.and.returnValue(of(mockState));

      // Ejecutar ngOnInit
      component.ngOnInit();

      // Verificar que se llamó a observe con los breakpoints correctos
      expect(breakpointObserverSpy.observe).toHaveBeenCalledWith([
        Breakpoints.XSmall,
        Breakpoints.Small,
      ]);
      // Verificar que isSmallScreen se establece en true
      expect(component.isSmallScreen).toBeTrue();
    });

    it('Debería suscribirse a BreakpointObserver y establecer isSmallScreen en false para pantallas que no son pequeñas.', () => {
      // Simular que el breakpointObserver devuelve un estado de pantalla no pequeña
      const mockState: BreakpointState = {
        matches: false,
        breakpoints: {
          [Breakpoints.XSmall]: false,
          [Breakpoints.Small]: false,
        },
      };
      breakpointObserverSpy.observe.and.returnValue(of(mockState));

      // Ejecutar ngOnInit
      component.ngOnInit();

      // Verificar que se llamó a observe con los breakpoints correctos
      expect(breakpointObserverSpy.observe).toHaveBeenCalledWith([
        Breakpoints.XSmall,
        Breakpoints.Small,
      ]);
      // Verificar que isSmallScreen se establece en false
      expect(component.isSmallScreen).toBeFalse();
    });
  });
});
