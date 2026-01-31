import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MiniMapV2Component } from './mini-map-v2.component';
import { MiniMapService } from '@app/shared/services/mini-map/mini-map.service';
import { MapasBase } from '@app/core/interfaces/enums/MapasBase.enum';
import { SimpleChange } from '@angular/core';

/**
 * Simulación del servicio MiniMapService
 * Evita conexiones HTTP reales.
 */
class MockMiniMapService {
  updateMiniMapLayer = jasmine.createSpy('updateMiniMapLayer');
  setPanEnabled = jasmine.createSpy('setPanEnabled');
}

describe('MiniMapV2Component', () => {
  let component: MiniMapV2Component;
  let fixture: ComponentFixture<MiniMapV2Component>;
  let mockService: MockMiniMapService;

  beforeEach(async () => {
    mockService = new MockMiniMapService();

    await TestBed.configureTestingModule({
      imports: [MiniMapV2Component], // componente standalone
      providers: [{ provide: MiniMapService, useValue: mockService }],
    }).compileComponents();

    fixture = TestBed.createComponent(MiniMapV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ---------- PRUEBAS BÁSICAS ----------

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería iniciar minimizado por defecto', () => {
    expect(component.isMiniMapVisible).toBeFalse();
  });

  it('debería alternar la visibilidad del mini mapa', () => {
    component.toggleMinimize();
    expect(component.isMiniMapVisible).toBeTrue();

    component.toggleMinimize();
    expect(component.isMiniMapVisible).toBeFalse();
  });

  // ---------- PRUEBAS DE BASEMAP ----------

  it('debería invocar updateMiniMapLayer al cambiar baseMap', () => {
    const nuevoMapa: MapasBase = MapasBase.OSM;
    component.baseMap = nuevoMapa;

    expect(mockService.updateMiniMapLayer).toHaveBeenCalledWith(nuevoMapa);
    expect(component.baseMap).toBe(nuevoMapa);
  });

  it('debería usar GOOGLE_SATELLITE como valor por defecto si baseMap es undefined', () => {
    component.baseMap = undefined as unknown as MapasBase;

    expect(component.baseMap).toBe(MapasBase.GOOGLE_SATELLITE);
    expect(mockService.updateMiniMapLayer).toHaveBeenCalledWith(
      MapasBase.GOOGLE_SATELLITE
    );
  });

  // ---------- PRUEBAS DE ngOnChanges / isPanEnabled ----------

  it('debería llamar setPanEnabled del servicio cuando cambia isPanEnabled a true', () => {
    component.isPanEnabled = true;

    component.ngOnChanges({
      isPanEnabled: new SimpleChange(false, true, false),
    });

    expect(mockService.setPanEnabled).toHaveBeenCalledWith(true);
  });

  it('debería llamar setPanEnabled del servicio cuando cambia isPanEnabled a false', () => {
    component.isPanEnabled = false;

    component.ngOnChanges({
      isPanEnabled: new SimpleChange(true, false, false),
    });

    expect(mockService.setPanEnabled).toHaveBeenCalledWith(false);
  });

  it('no debería llamar setPanEnabled si no cambia isPanEnabled', () => {
    component.ngOnChanges({
      // Simula un cambio en otra @Input cualquiera, por ejemplo width
      width: new SimpleChange('10rem', '12rem', false),
    });

    expect(mockService.setPanEnabled).not.toHaveBeenCalled();
  });

  // ---------- PRUEBAS DE CLASES DINÁMICAS DEL BOTÓN ----------

  it('debería devolver las clases correctas según la posición del botón (bottom-right)', () => {
    component.buttonPosition = 'bottom-right';
    expect(component.buttonClasses).toEqual([
      'bottom-0',
      'right-0',
      'translate-x-100',
    ]);
  });

  it('debería devolver las clases correctas según la posición del botón (top-left)', () => {
    component.buttonPosition = 'top-left';
    expect(component.buttonClasses).toEqual([
      'top-0',
      'left-0',
      '-translate-x-100',
    ]);
  });

  it('debería devolver arreglo vacío si la posición del botón no coincide con ninguna opción conocida', () => {
    component.buttonPosition = 'cualquiera' as 'top-left';
    expect(component.buttonClasses).toEqual([]);
  });

  // ---------- PRUEBAS DE CLASES DINÁMICAS DE LA VENTANA ----------

  it('debería devolver las clases correctas según la posición de la ventana (top-left)', () => {
    component.mapPosition = 'top-left';
    expect(component.windowPositionClasses).toEqual(['top-0', 'left-0']);
  });

  it('debería devolver las clases correctas según la posición de la ventana (top-right)', () => {
    component.mapPosition = 'top-right';
    expect(component.windowPositionClasses).toEqual(['top-0', 'right-0']);
  });

  it('debería devolver arreglo vacío si la posición del mapa no coincide con ninguna opción conocida', () => {
    component.mapPosition = 'otra-posicion' as 'top-left';
    expect(component.windowPositionClasses).toEqual([]);
  });

  // ---------- PRUEBAS DE TAMAÑO E ICONO ----------

  it('debería devolver el tamaño correcto del botón según buttonSize', () => {
    component.buttonSize = 'small';
    expect(component.buttonSizeValue).toBe('small');

    component.buttonSize = 'large';
    expect(component.buttonSizeValue).toBe('large');

    component.buttonSize = 'normal';
    expect(component.buttonSizeValue).toBeUndefined();
  });

  it('debería devolver el icono por defecto cuando no se establece ninguno', () => {
    component.buttonIcon = undefined;
    expect(component.buttonIconValue).toBe('pi pi-eye');
  });

  it('debería devolver el icono personalizado cuando se establece uno', () => {
    component.buttonIcon = 'pi pi-map';
    expect(component.buttonIconValue).toBe('pi pi-map');
  });

  // ---------- PRUEBAS DE REDONDEO ----------

  it('debería devolver true si buttonRounded no está definido', () => {
    component.buttonRounded = undefined;
    expect(component.buttonRoundedValue).toBeTrue();
  });

  it('debería devolver el valor de buttonRounded si está definido', () => {
    component.buttonRounded = false;
    expect(component.buttonRoundedValue).toBeFalse();

    component.buttonRounded = true;
    expect(component.buttonRoundedValue).toBeTrue();
  });

  // ---------- PRUEBA DE ID ÚNICO ----------

  it('debería generar un ID único para cada instancia', () => {
    const nuevoFixture: ComponentFixture<MiniMapV2Component> =
      TestBed.createComponent(MiniMapV2Component);

    const otraInstancia: MiniMapV2Component = nuevoFixture.componentInstance;

    expect(component.miniMapId).not.toBe(otraInstancia.miniMapId);
  });

  it('debería permitir asignar un título al header', () => {
    component.headerTitle = 'Prueba título';
    expect(component.headerTitle).toBe('Prueba título');
  });
});
