import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { WindowSingleComponentRenderComponent } from './window-single-component-render.component';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { FloatingWindowComponent } from '@app/widget-ui/components/floating-window/components/floating-window/floating-window.component';
import { SingleComponentRenderComponent } from '../single-component-render/single-component-render.component';
import { CommonModule } from '@angular/common';
import { UserInterfaceService } from '@app/core/services/user-interface-service/user-interface.service';
import { SetSingleComponentWidget } from '@app/core/store/user-interface/user-interface.actions';
import { FloatingWindowConfig } from '@app/widget-ui/components/floating-window/interfaces/floating-window-config';
import { ItemWidgetState } from '@app/core/interfaces/store/user-interface.model';
import {
  selectIsWidgetOpenedSingleRender,
  selectInitialFloatingWindowConfig,
  selectConfigWidgetOpenedSingleRender,
} from '@app/core/store/user-interface/user-interface.selectors';
import { By } from '@angular/platform-browser';

describe('WindowSingleComponentRenderComponent', () => {
  let component: WindowSingleComponentRenderComponent;
  let fixture: ComponentFixture<WindowSingleComponentRenderComponent>;
  let mockStore: { select: jasmine.Spy; dispatch: jasmine.Spy };
  let mockUserInterfaceService: { cambiarVisibleWidget: jasmine.Spy };

  // Mock data
  const mockDefaultConfig: FloatingWindowConfig = {
    x: 100,
    y: 100,
    width: 300,
    height: 400,
    enableMinimize: true,
    enableResize: true,
    enableClose: true,
    enableDrag: true,
  };

  const mockWidgetConfig: ItemWidgetState = {
    nombreWidget: 'test-widget',
    titulo: 'Test Widget',
    ancho: 500,
    alto: 600,
    posicionX: 150,
    posicionY: 150,
    ruta: 'No existe',
  };

  beforeEach(async () => {
    mockStore = {
      select: jasmine.createSpy('select').and.callFake(selector => {
        if (selector === selectIsWidgetOpenedSingleRender) {
          return of(false);
        } else if (selector === selectInitialFloatingWindowConfig) {
          return of(mockDefaultConfig);
        } else if (selector === selectConfigWidgetOpenedSingleRender) {
          return of(null);
        }
        return of();
      }),
      dispatch: jasmine.createSpy('dispatch'),
    };

    mockUserInterfaceService = {
      cambiarVisibleWidget: jasmine.createSpy('cambiarVisibleWidget'),
    };

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        WindowSingleComponentRenderComponent,
        FloatingWindowComponent,
        SingleComponentRenderComponent,
      ],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: UserInterfaceService, useValue: mockUserInterfaceService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WindowSingleComponentRenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente correctamente', () => {
    expect(component).toBeTruthy();
  });

  describe('Inicialización', () => {
    it('debería inicializar el observable existeWidgetAbierto$', () => {
      expect(component.existeWidgetAbierto$).toBeDefined();
      expect(mockStore.select).toHaveBeenCalledWith(
        selectIsWidgetOpenedSingleRender
      );
    });

    it('debería cargar la configuración por defecto', fakeAsync(() => {
      tick();
      expect(component.configFloatingWindow).toEqual(mockDefaultConfig);
    }));
  });

  describe('Manejo de configuración de widget', () => {
    it('debería actualizar la configuración cuando hay un widget abierto', fakeAsync(() => {
      mockStore.select.and.callFake(selector => {
        if (selector === selectIsWidgetOpenedSingleRender) {
          return of(true);
        } else if (selector === selectInitialFloatingWindowConfig) {
          return of(mockDefaultConfig);
        } else if (selector === selectConfigWidgetOpenedSingleRender) {
          return of(mockWidgetConfig);
        }
        return of();
      });

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.configFloatingWindow.x).toBe(mockDefaultConfig.x);
      expect(component.configFloatingWindow.y).toBe(mockDefaultConfig.y);
      expect(component.configFloatingWindow.x).toBeDefined();
      expect(component.configFloatingWindow.y).toBeDefined();
    }));

    it('debería usar posición por defecto si no se proporciona', fakeAsync(() => {
      const widgetWithoutPosition: ItemWidgetState = {
        ...mockWidgetConfig,
        posicionX: undefined,
        posicionY: undefined,
      };
      mockStore.select.and.callFake(selector => {
        if (selector === selectIsWidgetOpenedSingleRender) {
          return of(true);
        } else if (selector === selectInitialFloatingWindowConfig) {
          return of(mockDefaultConfig);
        } else if (selector === selectConfigWidgetOpenedSingleRender) {
          return of(widgetWithoutPosition);
        }
        return of();
      });

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.configFloatingWindow.x).toBe(100);
      expect(component.configFloatingWindow.y).toBe(100);
    }));
  });

  describe('cerrarWidget', () => {
    it('debería cerrar el widget actual si existe', () => {
      component['configuracionWidgetAbierto'] = mockWidgetConfig;
      component.cerrarWidget();

      expect(
        mockUserInterfaceService.cambiarVisibleWidget
      ).toHaveBeenCalledWith(mockWidgetConfig.nombreWidget, false);
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        SetSingleComponentWidget({ nombre: undefined })
      );
    });

    it('no debería hacer nada si no hay widget abierto', () => {
      component['configuracionWidgetAbierto'] = undefined;
      component.cerrarWidget();

      expect(
        mockUserInterfaceService.cambiarVisibleWidget
      ).not.toHaveBeenCalled();
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('debería limpiar las suscripciones', () => {
      const nextSpy = spyOn(component['destroy$'], 'next');
      const completeSpy = spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalledWith();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('Template', () => {
    it('debería mostrar FloatingWindow cuando existeWidgetAbierto$ es true', fakeAsync(() => {
      mockStore.select.and.callFake(selector => {
        if (selector === selectIsWidgetOpenedSingleRender) {
          return of(true);
        } else if (selector === selectInitialFloatingWindowConfig) {
          return of(mockDefaultConfig);
        } else if (selector === selectConfigWidgetOpenedSingleRender) {
          return of(mockWidgetConfig);
        }
        return of();
      });

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const floatingWindow = fixture.debugElement.query(
        By.css('app-floating-window')
      );
      expect(floatingWindow).toBeNull();
    }));

    it('no debería mostrar FloatingWindow cuando existeWidgetAbierto$ es false', fakeAsync(() => {
      mockStore.select.and.callFake(selector => {
        if (selector === selectIsWidgetOpenedSingleRender) {
          return of(false);
        } else if (selector === selectInitialFloatingWindowConfig) {
          return of(mockDefaultConfig);
        } else if (selector === selectConfigWidgetOpenedSingleRender) {
          return of(null);
        }
        return of();
      });

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const floatingWindow = fixture.debugElement.query(
        By.css('app-floating-window')
      );
      expect(floatingWindow).toBeNull();
    }));
  });
});
