import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { IndexPageComponent } from './index-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { LayoutAComponent } from '@app/widget-ui/layouts/layout-a/layout-a.component';
import { MapComponent } from '@app/core/components/map/map.component';
import { OpiacHeaderComponent } from '@projects/opiac/components/opiac-header/opiac-header.component';
import { CoordinateScaleLineComponent } from '@projects/opiac/components/coordinate-scale-line/coordinate-scale-line.component';
import { FloatingMenuComponent } from '@projects/opiac/components/floating-menu/floating-menu.component';
import { WindowSingleComponentRenderComponent } from '@app/widget-ui/components/window-single-component-render/window-single-component-render.component';
import { SidebarComponent } from '@projects/opiac/components/sidebar/components/sidebar/sidebar.component';
import { FloatingMapControlsComponent } from '@projects/opiac/components/floating-map-controls/floating-map-controls.component';
import { WindowTablaAtributosComponent } from '@projects/opiac/components/window-tabla-atributos/window-tabla-atributos.component';
import { ExportMap2WrapperComponent } from '@projects/opiac/components/export-map2-wrapper/export-map2-wrapper.component';
import { Breakpoints } from '@angular/cdk/layout';
import { of } from 'rxjs';
import {
  IWidgetConfig,
  WIDGET_CONFIG,
} from '@app/core/config/interfaces/IWidgetConfig';
import { Type } from '@angular/core';

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
      imports: [
        IndexPageComponent,
        BrowserAnimationsModule,
        CommonModule,
        LayoutAComponent,
        MapComponent,
        OpiacHeaderComponent,
        CoordinateScaleLineComponent,
        FloatingMenuComponent,
        WindowSingleComponentRenderComponent,
        SidebarComponent,
        FloatingMapControlsComponent,
        WindowTablaAtributosComponent,
        ExportMap2WrapperComponent,
      ],
      providers: [
        provideMockStore(),
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: WIDGET_CONFIG, useValue: mockConfig },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IndexPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should subscribe to BreakpointObserver and set isSmallScreen to true for small screens', () => {
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

    it('should subscribe to BreakpointObserver and set isSmallScreen to false for non-small screens', () => {
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
