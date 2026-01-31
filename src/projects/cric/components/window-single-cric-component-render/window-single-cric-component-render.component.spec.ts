import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { MemoizedSelector } from '@ngrx/store';

// Componentes, selectores y tipos usados por el componente
import { WindowSingleCricComponentRenderComponent } from './window-single-cric-component-render.component';
import {
  selectConfigWidgetOpenedSingleRender,
  selectIsWidgetOpenedSingleRender,
} from '@app/core/store/user-interface/user-interface.selectors';
import {
  ItemWidgetState,
  UserInterfaceState,
} from '@app/core/interfaces/store/user-interface.model';
import { UserInterfaceService } from '@app/core/services/user-interface-service/user-interface.service';
import { SetSingleComponentWidget } from '@app/core/store/user-interface/user-interface.actions';
import { FloatingWindowConfig } from '@app/widget-ui/components/floating-window/interfaces/floating-window-config';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

/**
 * Mock del servicio UserInterfaceService que expone la función cambiarVisibleWidget.
 * Usamos jasmine.createSpy para poder comprobar llamadas.
 */
class MockUserInterfaceService {
  public cambiarVisibleWidget = jasmine.createSpy('cambiarVisibleWidget');
}

describe('WindowSingleCricComponentRenderComponent', () => {
  // Fixture y componente bajo prueba
  let fixture: ComponentFixture<WindowSingleCricComponentRenderComponent>;
  let component: WindowSingleCricComponentRenderComponent;

  // MockStore tipado con el slice esperado { userInterface: UserInterfaceState }
  let store: MockStore<{ userInterface: UserInterfaceState }>;

  // Selectores mockeados (tipados con MemoizedSelector)
  let mockConfigSelector: MemoizedSelector<
    { userInterface: UserInterfaceState },
    ItemWidgetState | undefined
  >;
  let mockIsOpenedSelector: MemoizedSelector<
    { userInterface: UserInterfaceState },
    boolean
  >;

  // Antes de cada prueba: configurar TestBed
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Importamos el componente standalone a probar
      imports: [WindowSingleCricComponentRenderComponent],
      providers: [
        // Proveemos un MockStore para que el componente pueda inyectar Store sin errores
        provideMockStore({
          initialState: {
            userInterface: {
              // valores iniciales mínimos; shape requerido por selectores
            } as UserInterfaceState,
          },
        }),
        // Reemplazamos UserInterfaceService por nuestro mock
        { provide: UserInterfaceService, useClass: MockUserInterfaceService },
        // Deshabilitamos animaciones para evitar errores con librerías que usan animaciones
        provideNoopAnimations(),
      ],
    }).compileComponents();

    // Obtenemos la instancia del MockStore con el tipo adecuado
    store = TestBed.inject(
      MockStore as unknown as new <T>() => MockStore<T>
    ) as MockStore<{ userInterface: UserInterfaceState }>;

    // Override (mock) de los selectores usados por el componente.
    // Inicialmente no hay widget abierto; config undefined.
    mockIsOpenedSelector = store.overrideSelector(
      selectIsWidgetOpenedSingleRender,
      false
    );
    mockConfigSelector = store.overrideSelector(
      selectConfigWidgetOpenedSingleRender,
      undefined
    );

    // Creamos el fixture y la instancia del componente
    fixture = TestBed.createComponent(WindowSingleCricComponentRenderComponent);
    component = fixture.componentInstance;

    // Asignamos una configFloatingWindow inicial requerida por el @Input({required:true})
    component.configFloatingWindow = {
      x: 0,
      y: 0,
      width: 400,
      height: 300,
      maxHeight: 600,
      maxWidth: 800,
    } as FloatingWindowConfig;

    // Detectamos cambios para que el constructor y las suscripciones arranquen
    fixture.detectChanges();
  });

  /* ===========================
     PRUEBAS
     =========================== */

  it('debería crearse el componente', () => {
    // Verificamos que el componente se haya instanciado correctamente
    expect(component).toBeTruthy();
  });

  it('debería cerrar el widget si hay configuración cargada', () => {
    // Preparamos un ItemWidgetState simulado
    const widget: ItemWidgetState = {
      nombreWidget: 'TestWidget',
      ruta: 'ruta/prueba',
      titulo: 'Mi Widget Test',
      ancho: 300,
      alto: 200,
      anchoMaximo: 600,
      altoMaximo: 400,
      posicionX: 10,
      posicionY: 20,
    };

    // Establecemos que el componente tiene esa configuración abierta
    component.configuracionWidgetAbierto = widget;

    // Espiamos dispatch del store para comprobar la acción despachada
    const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();

    // Ejecutamos el método que cierra el widget
    component.cerrarWidget();

    // Verificamos que el servicio haya sido llamado para ocultar el widget
    const uiService = TestBed.inject(UserInterfaceService);
    // Lo tratamos explícitamente como jasmine.Spy
    const spy = uiService.cambiarVisibleWidget as jasmine.Spy;

    expect(spy).toHaveBeenCalledWith('TestWidget', false);

    // Verificamos que se haya despachado la acción SetSingleComponentWidget con nombre undefined
    expect(dispatchSpy).toHaveBeenCalledWith(
      SetSingleComponentWidget({ nombre: undefined })
    );
  });

  it('no debería cerrar el widget si no hay configuración cargada', () => {
    // Aseguramos que no exista configuración
    component.configuracionWidgetAbierto = undefined;

    // Espiamos dispatch y el servicio para confirmar que no se llaman
    const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();
    const uiService = TestBed.inject(UserInterfaceService);
    // Lo tratamos explícitamente como jasmine.Spy
    const spy = uiService.cambiarVisibleWidget as jasmine.Spy;
    expect(spy).not.toHaveBeenCalled();

    (uiService.cambiarVisibleWidget as jasmine.Spy).calls.reset();

    // Llamamos cerrarWidget
    component.cerrarWidget();

    // Ninguna llamada al servicio ni dispatch debe haberse producido
    expect(uiService.cambiarVisibleWidget).not.toHaveBeenCalled();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('debería actualizar configuracionWidgetAbierto y configFloatingWindow desde el store', () => {
    // Creamos una configuración de widget que emula la forma esperada por ItemWidgetState
    const testConfig: ItemWidgetState = {
      nombreWidget: 'ExportarMapa3',
      ruta: 'ruta/salida',
      titulo: 'Mi Widget V2', // contiene " V2" que debe eliminarse en la transformación
      ancho: 500,
      alto: 400,
      anchoMaximo: 1000,
      altoMaximo: 900,
      posicionX: 50,
      posicionY: 60,
    };

    // Emitimos el nuevo valor desde el selector mockeado
    mockConfigSelector.setResult(testConfig);
    // Forzamos al MockStore a propagar el nuevo estado a los suscriptores
    store.refreshState();
    // Aplicamos cambios para que el componente procese la nueva configuración
    fixture.detectChanges();

    // Ahora la configuración interna del componente debe haberse actualizado y transformar el título
    expect(component.configuracionWidgetAbierto).toBeDefined();
    expect(component.configuracionWidgetAbierto?.titulo).toBe('Mi Widget'); // ' V2' eliminado

    // Además la configFloatingWindow debe haberse mutado conforme a las propiedades del widget
    expect(component.configFloatingWindow.width).toBe(500);
    expect(component.configFloatingWindow.height).toBe(400);
    expect(component.configFloatingWindow.x).toBe(50);
    expect(component.configFloatingWindow.y).toBe(60);

    // También se respetan los maximos (toma altoMaximo del widget si existe)
    expect(component.configFloatingWindow.maxHeight).toBe(900);
    expect(component.configFloatingWindow.maxWidth).toBe(1000);
  });

  it('debería transformar el título "Exportar Mapa 3" en "Salida Gráfica"', () => {
    // Config con el título especial que requiere transformación
    const exportConfig: ItemWidgetState = {
      nombreWidget: 'ExportarMapa3',
      ruta: 'ruta/exportar',
      titulo: 'Exportar Mapa 3',
      ancho: 400,
      alto: 300,
      anchoMaximo: 800,
      altoMaximo: 600,
    };

    // Emitimos la configuración especial
    mockConfigSelector.setResult(exportConfig);
    store.refreshState();
    fixture.detectChanges();

    // El componente debe haber transformado el título a "Salida Gráfica"
    expect(component.configuracionWidgetAbierto?.titulo).toBe('Salida Gráfica');
  });

  it('debería dejar de recibir actualizaciones después de ngOnDestroy', () => {
    // Preparamos y emitimos una primera configuración
    const firstConfig: ItemWidgetState = {
      nombreWidget: 'W1',
      ruta: 'r1',
      titulo: 'Primero',
      ancho: 200,
      alto: 150,
      anchoMaximo: 400,
      altoMaximo: 300,
    };
    mockConfigSelector.setResult(firstConfig);
    store.refreshState();
    fixture.detectChanges();

    // Validamos que el componente recibió la primera configuración
    expect(component.configuracionWidgetAbierto?.nombreWidget).toBe('W1');

    // Llamamos ngOnDestroy para cerrar las suscripciones vía destroy$
    component.ngOnDestroy();

    // Emitimos un nuevo valor después del destroy
    const secondConfig: ItemWidgetState = {
      nombreWidget: 'W2',
      ruta: 'r2',
      titulo: 'Segundo',
      ancho: 300,
      alto: 250,
      anchoMaximo: 600,
      altoMaximo: 500,
    };
    mockConfigSelector.setResult(secondConfig);
    store.refreshState();
    fixture.detectChanges();

    // Como las suscripciones fueron cerradas, la configuración no debe haberse actualizado a 'W2'
    // (permanece la que tenía antes del destroy)
    expect(component.configuracionWidgetAbierto?.nombreWidget).not.toBe('W2');
  });

  it('debería renderizar app-floating-window cuando hay widget y isMobile=false', () => {
    // Simulamos que existe un widget abierto
    const cfg: ItemWidgetState = {
      nombreWidget: 'WRender',
      ruta: 'r',
      titulo: 'Render',
      ancho: 250,
      alto: 200,
      anchoMaximo: 500,
      altoMaximo: 400,
    };
    mockConfigSelector.setResult(cfg);
    mockIsOpenedSelector.setResult(true);
    store.refreshState();

    // Aseguramos que el componente esté en modo desktop
    component.isMobile = false;
    fixture.detectChanges();

    // Buscamos el elemento <app-floating-window> en el DOM renderizado
    const floating = fixture.nativeElement.querySelector('app-floating-window');
    expect(floating).toBeTruthy();
  });

  it('debería renderizar app-mobile-floating-tab-window cuando hay widget y isMobile=true', () => {
    // Simulamos widget abierto
    const cfg: ItemWidgetState = {
      nombreWidget: 'WRenderMobile',
      ruta: 'r',
      titulo: 'Render Mobile',
      ancho: 200,
      alto: 180,
      anchoMaximo: 400,
      altoMaximo: 360,
    };
    mockConfigSelector.setResult(cfg);
    mockIsOpenedSelector.setResult(true);
    store.refreshState();

    // Cambiamos a modo móvil
    component.isMobile = true;
    fixture.detectChanges();

    // Buscamos el elemento <app-mobile-floating-tab-window> en el DOM renderizado
    const mobile = fixture.nativeElement.querySelector(
      'app-mobile-floating-tab-window'
    );
    expect(mobile).toBeTruthy();
  });
});
