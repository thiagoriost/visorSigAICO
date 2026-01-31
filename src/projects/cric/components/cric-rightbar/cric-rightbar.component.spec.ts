/**
 * Pruebas unitarias para CricRightbarComponent
 *
 * Objetivo:
 * - Verificar que el componente se crea correctamente.
 * - Confirmar que se suscribe al store y configura la propiedad configMapNavButtonsInitial con datos válidos.
 * - Validar que se muestra advertencia si no hay datos del store.
 * - Comprobar que el uso de takeUntil funciona (ngOnDestroy cancela suscripciones).
 * - Verificar que el evento onSeleccion despacha la acción esperada al store.
 * - Asegurar que el template renderiza los componentes hijos (BotoneraVertical y MapNavButtons).
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CricRightbarComponent } from './cric-rightbar.component';
import { Store } from '@ngrx/store';
import { of, Subject } from 'rxjs';
import { MapNavButtonsInterface } from '@app/widget/map-nav-buttons/interfaces/map-nav-buttons.interface';
import { SetSingleComponentWidget } from '@app/core/store/user-interface/user-interface.actions';
import { BotoneraVerticalComponent } from '@app/widget-ui/components/botoneraVertical/components/botonera-vertical/botonera-vertical.component';
import { MapNavButtonsComponent } from '@app/widget/map-nav-buttons/components/map-nav-buttons/map-nav-buttons.component';
import { By } from '@angular/platform-browser';

// Mock del Store de NgRx
class MockStore {
  // Simulación del método select de NgRx
  public select = jasmine.createSpy('select').and.returnValue(of(undefined));
  // Simulación del método dispatch de NgRx
  public dispatch = jasmine.createSpy('dispatch');
}

describe('CricRightbarComponent', () => {
  let component: CricRightbarComponent;
  let fixture: ComponentFixture<CricRightbarComponent>;
  let store: MockStore;

  beforeEach(async () => {
    // Creamos el mock del store
    store = new MockStore();

    // Declaramos el componente y sus dependencias en imports
    await TestBed.configureTestingModule({
      imports: [
        CricRightbarComponent,
        BotoneraVerticalComponent,
        MapNavButtonsComponent,
      ],
      providers: [
        // Inyectamos el mock en lugar del Store real
        { provide: Store, useValue: store },
      ],
    }).compileComponents();

    // Creamos el fixture (entorno de pruebas) y la instancia del componente
    fixture = TestBed.createComponent(CricRightbarComponent);
    component = fixture.componentInstance;
  });

  // Creación del componente
  it('debería crearse el componente', () => {
    // Verifica que el componente fue creado correctamente
    expect(component).toBeTruthy();
  });

  // ngOnInit() debe despachar configuración si el store devuelve datos
  it('debería construir la configuración y despachar acción al store si hay datos del selector', () => {
    // Creamos un objeto que cumple con la interfaz MapNavButtonsInterface
    const mockWidgetData: MapNavButtonsInterface = {
      showZoomIn: true,
      showZoomOut: true,
      showAdvancedZoomIn: false,
      showAdvancedZoomOut: false,
      showResetView: true,
      showToggleMouseWheelZoom: false,
      showPan: true,
      initialCenter: [0, 0],
      initialZoom: 5,
      isMouseWheelZoomEnabled: true,
      isPanEnabled: true,
      minZoom: 1,
      maxZoom: 10,
      orderZoomIn: 1,
      orderZoomOut: 2,
      orderAdvancedZoomIn: 3,
      orderAdvancedZoomOut: 4,
      orderResetView: 5,
      orderToggleMouseWheelZoom: 6,
      orderPan: 7,
      gapButtons: 5,
      rounded: true,
      showHistory: false,
      orderHistoryBack: 0,
      orderHistoryNext: 0,
    };

    // Sobrescribimos el selector para que devuelva datos válidos
    (store.select as jasmine.Spy).and.returnValue(of(mockWidgetData));
    // Llamamos ngOnInit
    component.ngOnInit();

    /**
     * Assert: Verificamos que el componente haya despachado una acción
     * del tipo definido en MapActions.setWidgetNavButtonsData.
     */
    expect(store.dispatch).toHaveBeenCalled();
    const dispatchedArg = store.dispatch.calls.mostRecent().args[0];
    expect(dispatchedArg.type).toBe('[General] Set Widget NavButtons Data');
    expect(dispatchedArg.widgetId).toBe('MapNavButtons');
    expect(dispatchedArg.data.showZoomIn).toBeTrue();
    expect(dispatchedArg.data.showPan).toBeTrue();
    expect(dispatchedArg.data.gapButtons).toBe(5);
  });

  // ngOnInit() no debe despachar si no hay datos en el selector
  it('no debería despachar acción si el selector devuelve undefined', () => {
    // Forzamos que select devuelva undefined
    (store.select as jasmine.Spy).and.returnValue(of(undefined));

    // Llamamos ngOnInit
    component.ngOnInit();

    // Verificamos que se mostró la advertencia
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  // buildMapNavButtonsConfigCric() retorna configuración correcta
  it('debería construir correctamente el objeto de configuración interna', () => {
    //Arrange: Objeto base de prueba.
    const baseConfig: MapNavButtonsInterface = {
      showZoomIn: false,
      showZoomOut: false,
      showAdvancedZoomIn: false,
      showAdvancedZoomOut: false,
      showResetView: false,
      showToggleMouseWheelZoom: false,
      showPan: true,
      initialCenter: [10, 20],
      initialZoom: 3,
      isMouseWheelZoomEnabled: false,
      isPanEnabled: false,
      minZoom: 1,
      maxZoom: 10,
      orderZoomIn: 2,
      orderZoomOut: 3,
      orderAdvancedZoomIn: 4,
      orderAdvancedZoomOut: 5,
      orderResetView: 6,
      orderToggleMouseWheelZoom: 7,
      orderPan: 8,
      gapButtons: 10,
      showHistory: false,
      orderHistoryBack: 0,
      orderHistoryNext: 0,
    };

    // Llamamar el método privado usando indexación de tipo seguro.
    const result: MapNavButtonsInterface = (
      component as unknown as {
        buildMapNavButtonsConfigCric: (
          cfg: MapNavButtonsInterface
        ) => MapNavButtonsInterface;
      }
    ).buildMapNavButtonsConfigCric(baseConfig);

    // Verificar que el objeto retornado contenga los valores esperados.
    expect(result.showPan).toBeTrue();
    expect(result.showZoomIn).toBeTrue();
    expect(result.showZoomOut).toBeTrue();
    expect(result.isMouseWheelZoomEnabled).toBeTrue();
    expect(result.orderPan).toBe(0);
    expect(result.buttomSeverity).toBe('primary');
  });

  // ngOnDestroy() debe cerrar el Subject destroy$
  it('debería ejecutar next() y complete() en destroy$ cuando se llame ngOnDestroy', () => {
    // Obtenemos la referencia privada destroy$ de forma segura sin usar any
    const destroy$: Subject<void> = component['destroy$'];

    // Espiamos los métodos next y complete
    const nextSpy = spyOn(destroy$, 'next').and.callThrough();
    const completeSpy = spyOn(destroy$, 'complete').and.callThrough();

    // Llamamos ngOnDestroy
    component.ngOnDestroy();

    // Validamos que el Subject haya emitido y completado
    expect(nextSpy).toHaveBeenCalledTimes(1);
    expect(completeSpy).toHaveBeenCalledTimes(1);
  });

  // onSeleccion() debe despachar SetSingleComponentWidget
  it('debería despachar SetSingleComponentWidget al seleccionar un botón', () => {
    // Simulamos un evento de selección
    const mockEvent: { botonId: string; opcionId: string } = {
      botonId: '1',
      opcionId: 'DescargarManualCric',
    };

    // Ejecutamos onSeleccion
    component.onSeleccion(mockEvent);

    // Verificamos que dispatch fue llamado con la acción correcta
    expect(store.dispatch).toHaveBeenCalledWith(
      SetSingleComponentWidget({ nombre: 'DescargarManualCric' })
    );
  });

  // Renderizado del componente BotoneraVerticalComponent
  it('debería renderizar la botonera vertical en el template', () => {
    // Detectamos cambios para renderizar el template
    fixture.detectChanges();

    // Buscamos el componente hijo BotoneraVertical
    const botonera = fixture.debugElement.query(
      By.directive(BotoneraVerticalComponent)
    );

    // Validamos que existe en el DOM
    expect(botonera).toBeTruthy();
  });

  // Renderizado del componente MapNavButtonsComponent
  it('debería renderizar el componente de navegación de mapa en el template', () => {
    // Detectamos cambios para renderizar el template
    fixture.detectChanges();

    // Buscamos el componente hijo MapNavButtons
    const mapNavButtons = fixture.debugElement.query(
      By.directive(MapNavButtonsComponent)
    );

    // Validamos que existe en el DOM
    expect(mapNavButtons).toBeTruthy();
  });
});
