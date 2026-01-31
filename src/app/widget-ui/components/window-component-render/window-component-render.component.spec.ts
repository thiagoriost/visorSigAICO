/**
 * @description Pruebas unitarias para el componente WindowComponentRenderComponent.
 * @author javier.munoz@igac.gov.co
 * @date 06/08/2025
 */
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { WindowComponentRenderComponent } from './window-component-render.component';
import { WidgetRenderComponent } from '@app/widget-ui/components/widget-render/widget-render.component';
import { FloatingWindowComponent } from '@app/widget-ui/components/floating-window/components/floating-window/floating-window.component';
import {
  ItemWidgetState,
  UserInterfaceState,
} from '@app/core/interfaces/store/user-interface.model';
import { FloatingWindowConfig } from '@app/widget-ui/components/floating-window/interfaces/floating-window-config';
import { of } from 'rxjs';
import { initialActionsMapNavButtonsState } from '@app/core/store/user-interface/user-interface.reducer';

// Tipo para el selector dinámico
type SelectorFunction = (state: {
  widgetName: string;
}) => ItemWidgetState | undefined;

describe('WindowComponentRenderComponent', () => {
  let component: WindowComponentRenderComponent;
  let fixture: ComponentFixture<WindowComponentRenderComponent>;

  // Configuración inicial de la ventana
  const mockInitialFloatingWindowConfig: FloatingWindowConfig = {
    x: 100,
    y: 100,
    width: 300,
    height: 200,
    enableMinimize: true,
    enableResize: true,
    enableClose: true,
    enableDrag: true,
  };

  // Configuración del widget
  const mockWidgetConfig: ItemWidgetState = {
    titulo: 'Widget de Prueba',
    nombreWidget: 'testWidget',
    ruta: 'path/to/widget',
    posicionX: 150,
    posicionY: 150,
    abierto: true,
    ancho: 400,
    alto: 300,
    anchoMaximo: 800,
    altoMaximo: 600,
  };

  // Estado inicial del store
  const initialState: { userInterface: UserInterfaceState } = {
    userInterface: {
      widgets: [mockWidgetConfig],
      overlayWidgets: [],
      singleComponentNombreWidget: 'testWidget',
      initialFloatingWindowConfig: mockInitialFloatingWindowConfig,
      actionsMapNavButtons: initialActionsMapNavButtonsState,
      floatingWindowsOrder: [],
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        WindowComponentRenderComponent,
        WidgetRenderComponent,
        FloatingWindowComponent,
        StoreModule.forRoot({
          userInterface: (state = initialState.userInterface) => state,
        }), // Configuración mínima del store
      ],
      providers: [
        {
          provide: Store,
          useValue: {
            select: jasmine.createSpy('select').and.callFake(selector => {
              if (selector === 'selectInitialFloatingWindowConfig') {
                return of(mockInitialFloatingWindowConfig);
              }
              if (
                typeof selector === 'function' &&
                selector({ widgetName: 'testWidget' })
              ) {
                return of(mockWidgetConfig);
              }
              return of(undefined);
            }),
            dispatch: jasmine.createSpy('dispatch'),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WindowComponentRenderComponent);
    component = fixture.componentInstance;
    component.widgetName = 'testWidget'; // Establecer widgetName por defecto
  });

  /**
   * @description Verifica que el componente se crea correctamente.
   */
  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  /**
   * @description Verifica que se lanza un error si widgetName no está definido.
   */
  it('debería lanzar un error si widgetName no está proporcionado', () => {
    component.widgetName = ''; // Simular widgetName no proporcionado
    expect(() => fixture.detectChanges()).toThrowError(
      'widgetName no proporcionado'
    );
  });

  /**
   * @description Verifica que buildWindowConfig combina correctamente las configuraciones.
   */
  it('debería construir widgetFloatingWindowConfig correctamente', fakeAsync(() => {
    component.initialFloatingWindowConfig = mockInitialFloatingWindowConfig;
    component.widgetConfig = mockWidgetConfig;
    component.buildWindowConfig();
    tick();

    const expectedConfig: FloatingWindowConfig = {
      ...mockInitialFloatingWindowConfig,
      width: mockWidgetConfig.ancho!,
      height: mockWidgetConfig.alto!,
      maxWidth: mockWidgetConfig.anchoMaximo,
      maxHeight: mockWidgetConfig.altoMaximo,
    };

    expect(component.widgetFloatingWindowConfig).toEqual(expectedConfig);
  }));

  /**
   * @description Verifica que buildWindowConfig no hace nada si falta initialFloatingWindowConfig o widgetConfig.
   */
  it('no debería construir widgetFloatingWindowConfig si falta configuración', () => {
    component.initialFloatingWindowConfig = undefined;
    component.widgetConfig = undefined;
    component.buildWindowConfig();
    expect(component.widgetFloatingWindowConfig).toBeUndefined();
  });

  /**
   * @description Verifica que tituloWidget devuelve el título correcto o "..." si no está definido.
   */
  it('debería devolver el título del widget o "..." si no está definido', () => {
    component.widgetConfig = mockWidgetConfig;
    expect(component.tituloWidget).toBe('Widget de Prueba');

    component.widgetConfig = undefined;
    expect(component.tituloWidget).toBe('...');
  });

  /**
   * @description Verifica que onClose limpia widgetFloatingWindowConfig y emite windowClosed.
   */
  it('debería limpiar widgetFloatingWindowConfig y emitir windowClosed al cerrar', () => {
    const windowClosedSpy = spyOn(component.windowClosed, 'emit');
    component.widgetFloatingWindowConfig = mockInitialFloatingWindowConfig;
    component.onClose();

    expect(component.widgetFloatingWindowConfig).toBeUndefined();
    expect(windowClosedSpy).toHaveBeenCalled();
  });

  /**
   * @description Verifica que checkIfWidgetWasLoaded lanza un error si el widget no se encuentra.
   */
  it('debería lanzar un error si el widget no se encuentra después de 3 segundos', fakeAsync(() => {
    // Sobrescribir el mock del Store para simular widgetConfig undefined
    const store: Store = TestBed.inject(Store);
    store.select = jasmine
      .createSpy('select')
      .and.callFake((selector: string | SelectorFunction) => {
        if (selector === 'selectInitialFloatingWindowConfig') {
          return of(mockInitialFloatingWindowConfig);
        }
        return of(undefined); // Simular que no hay widgetConfig
      });

    component.widgetConfig = undefined; // Asegurar que widgetConfig esté undefined
    spyOn(console, 'info'); // Evitar salida en consola

    expect(() => {
      component.checkIfWidgetWasLoaded();
      tick(3000); // Esperar 3 segundos
    }).toThrowError('widget no encontrado en configuracion general');
  }));

  /**
   * @description Verifica que checkIfWidgetWasLoaded registra en consola si el widget se cargó.
   */
  it('debería registrar en consola si el widget se cargó correctamente', fakeAsync(() => {
    const consoleInfoSpy = spyOn(console, 'info');
    component.widgetConfig = mockWidgetConfig;
    component.checkIfWidgetWasLoaded();
    tick(3000);

    expect(consoleInfoSpy).toHaveBeenCalledWith('widget testWidget cargado');
  }));
});
