import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpcionesColorDibujoComponent } from './opciones-color-dibujo.component';
import { DibujarService } from '@app/widget/dibujar/services/dibujar/dibujar.service';
import { Subject } from 'rxjs';
import { ColorCombination } from '@app/widget/dibujar/interfaces/dibujar.colorCombination';
import { ColorPickerChangeEvent } from 'primeng/colorpicker';

// Mock estricto del servicio DibujarService
class DibujarServiceMock {
  longitudSubject = new Subject<number>();
  areaSubject = new Subject<number>();

  // Propiedades necesarias para validaciones
  textoArea = '';
  textoLongitud = '';
  mostrarArea = false;
  mostrarDistancia = false;

  addInteraction = jasmine.createSpy('addInteraction');
  removeDrawingInteraction = jasmine.createSpy('removeDrawingInteraction');
  clearAllGeometries = jasmine.createSpy('clearAllGeometries');
  updateFillColor = jasmine.createSpy('updateFillColor');
  updateStrokeColor = jasmine.createSpy('updateStrokeColor');
  updateStrokeWidth = jasmine.createSpy('updateStrokeWidth');
  deshacerDibujo = jasmine.createSpy('deshacerDibujo');
  recuperarDibujo = jasmine.createSpy('recuperarDibujo');
  borrarDibujo = jasmine.createSpy('borrarDibujo');
  puedeDeshacer = jasmine.createSpy('puedeDeshacer').and.returnValue(true);
  puedeRecuperar = jasmine.createSpy('puedeRecuperar').and.returnValue(false);
}

describe('OpcionesColorDibujoComponent', () => {
  let component: OpcionesColorDibujoComponent;
  let fixture: ComponentFixture<OpcionesColorDibujoComponent>;
  let dibujarServiceMock: DibujarServiceMock;

  // Evento simulado válido para el originalEvent de ColorPickerChangeEvent
  const fakeOriginalEvent = new Event('change');

  beforeEach(async () => {
    dibujarServiceMock = new DibujarServiceMock();

    await TestBed.configureTestingModule({
      imports: [OpcionesColorDibujoComponent], // Componente standalone
      providers: [{ provide: DibujarService, useValue: dibujarServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(OpcionesColorDibujoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('debe crear el componente correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar las unidades de medición y seleccionar valores por defecto', () => {
    expect(component.medicionArea.length).toBeGreaterThan(0);
    expect(component.medicionLongitud.length).toBeGreaterThan(0);
    expect(component.selectedArea).toEqual(component.medicionArea[1]); // km2
    expect(component.selectedLongitud).toEqual(component.medicionLongitud[1]); // km
  });

  it('debe suscribirse a los subjects de medición y actualizar resultados al emitir valores', () => {
    const longitudEnMetros = 2000;
    const areaEnMetrosCuadrados = 2_000_000;

    component.mostrarDistancia = true;
    component.mostrarArea = true;

    dibujarServiceMock.longitudSubject.next(longitudEnMetros);
    expect(component.resultadoLongitud).toBe('Distancia: 2.00 kilómetros');

    dibujarServiceMock.areaSubject.next(areaEnMetrosCuadrados);
    expect(component.resultadoArea).toBe('Área: 2.00 kilómetros cuadrados');
  });

  it('debe cancelar suscripciones y limpiar servicios en ngOnDestroy', () => {
    component.ngOnDestroy();
    expect(dibujarServiceMock.removeDrawingInteraction).toHaveBeenCalled();
    expect(dibujarServiceMock.clearAllGeometries).toHaveBeenCalled();
  });

  it('limpiarResultados debe resetear los resultados de medición', () => {
    component.resultadoArea = '10 m2';
    component.resultadoLongitud = '5 m';
    component.limpiarResultados();
    expect(component.resultadoArea).toBeUndefined();
    expect(component.resultadoLongitud).toBeUndefined();
  });

  it('selectArea debe limpiar resultados y activar interacción de polígono si selectedArea está definida', () => {
    component.selectedArea = component.medicionArea[0];
    component.selectArea();
    expect(component.resultadoArea).toBeUndefined();
    expect(component.resultadoLongitud).toBeUndefined();
    expect(dibujarServiceMock.addInteraction).toHaveBeenCalledWith('Polygon');
  });

  it('selectLongitud debe limpiar resultados y activar interacción de línea si selectedLongitud está definida', () => {
    component.selectedLongitud = component.medicionLongitud[0];
    component.selectLongitud();
    expect(component.resultadoArea).toBeUndefined();
    expect(component.resultadoLongitud).toBeUndefined();
    expect(dibujarServiceMock.addInteraction).toHaveBeenCalledWith(
      'LineString'
    );
  });

  it('updateLongitudResult debe convertir correctamente la longitud según la unidad seleccionada', () => {
    component.mostrarDistancia = true;

    component.selectedLongitud = { name: 'Millas', code: 'mi' };
    component.updateLongitudResult(1609.34);
    expect(component.resultadoLongitud).toBe('Distancia: 1.00 millas');

    component.selectedLongitud = { name: 'Metros', code: 'm' };
    component.updateLongitudResult(500);
    expect(component.resultadoLongitud).toBe('Distancia: 500.00 metros');
  });

  it('updateAreaResult debe convertir correctamente el área según la unidad seleccionada', () => {
    component.mostrarArea = true;

    component.selectedArea = { name: 'Héctareas', code: 'ha' };
    component.updateAreaResult(20000);
    expect(component.resultadoArea).toBe('Área: 2.00 hectáreas');

    component.selectedArea = { name: 'Metros Cuadrados', code: 'm2' };
    component.updateAreaResult(150);
    expect(component.resultadoArea).toBe('Área: 150.00 metros cuadrados');
  });

  it('selectPredefinedCombination debe aplicar combinación y llamar a métodos del servicio', () => {
    const combo: ColorCombination = {
      fillColor: '#123456',
      strokeColor: '#654321',
      strokeWidth: 4,
      transparency: 50,
    };
    component.selectPredefinedCombination(combo);

    expect(component.fillColor).toBe(combo.fillColor);
    expect(component.strokeColor).toBe(combo.strokeColor);
    expect(component.strokeWidth).toBe(combo.strokeWidth);
    expect(component.transparency).toBe(combo.transparency);

    const expectedAlpha = combo.transparency / 100;
    expect(dibujarServiceMock.updateFillColor).toHaveBeenCalledWith(
      component.hexToRgba(combo.fillColor, expectedAlpha)
    );
    expect(dibujarServiceMock.updateStrokeColor).toHaveBeenCalledWith(
      combo.strokeColor
    );
    expect(dibujarServiceMock.updateStrokeWidth).toHaveBeenCalledWith(
      combo.strokeWidth
    );
  });

  it('onFillColorChange debe actualizar el color de relleno y llamar al servicio', () => {
    const event: ColorPickerChangeEvent = {
      originalEvent: fakeOriginalEvent,
      value: '#abcdef',
    };
    component.onFillColorChange(event);
    expect(component.fillColor).toBe('#abcdef');
    expect(dibujarServiceMock.updateFillColor).toHaveBeenCalledWith('#abcdef');
  });

  it('onStrokeColorChange debe actualizar el color de contorno y llamar al servicio', () => {
    const event: ColorPickerChangeEvent = {
      originalEvent: fakeOriginalEvent,
      value: '#fedcba',
    };
    component.strokeColor = '#000000';
    component.onStrokeColorChange(event);
    expect(component.strokeColor).toBe('#fedcba');
    expect(dibujarServiceMock.updateStrokeColor).toHaveBeenCalledWith(
      '#000000'
    );
    expect(dibujarServiceMock.updateFillColor).toHaveBeenCalledWith('#fedcba');
  });

  it('onStrokeWidthChange debe actualizar el grosor y llamar al servicio', () => {
    component.onStrokeWidthChange(7);
    expect(component.strokeWidth).toBe(7);
    expect(dibujarServiceMock.updateStrokeWidth).toHaveBeenCalledWith(7);
  });

  it('onTransparencyChange debe actualizar transparencia y llamar al servicio con color RGBA', () => {
    component.fillColor = '#010203';
    component.onTransparencyChange(50);

    expect(component.transparency).toBe(50);
    expect(dibujarServiceMock.updateFillColor).toHaveBeenCalledWith(
      'rgba(1,2,3,0.5)'
    );
  });

  it('hexToRgba debe convertir correctamente un color hexadecimal a rgba', () => {
    const result = component.hexToRgba('#112233', 0.5);
    expect(result).toBe('rgba(17,34,51,0.5)');
  });

  it('fillColorWithTransparency debe devolver el color con transparencia aplicada', () => {
    component.fillColor = '#000000';
    component.transparency = 80;
    expect(component.fillColorWithTransparency).toBe('rgba(0,0,0,0.8)');
  });

  it('deshacerDibujo debe llamar al método correspondiente del servicio', () => {
    component.deshacerDibujo();
    expect(dibujarServiceMock.deshacerDibujo).toHaveBeenCalled();
  });

  it('recuperarDibujo debe llamar al método correspondiente del servicio', () => {
    component.recuperarDibujo();
    expect(dibujarServiceMock.recuperarDibujo).toHaveBeenCalled();
  });

  it('eliminarDibujo debe llamar al método correspondiente del servicio', () => {
    component.eliminarDibujo();
    expect(dibujarServiceMock.borrarDibujo).toHaveBeenCalled();
  });

  it('puedeDeshacer debe devolver el resultado del servicio', () => {
    expect(component.puedeDeshacer()).toBeTrue();
    expect(dibujarServiceMock.puedeDeshacer).toHaveBeenCalled();
  });

  it('puedeRecuperar debe devolver el resultado del servicio', () => {
    expect(component.puedeRecuperar()).toBeFalse();
    expect(dibujarServiceMock.puedeRecuperar).toHaveBeenCalled();
  });

  it('debe actualizar los switches según el tipo de geometría', () => {
    component.tipoGeometria = 'Polygon';
    component.ngOnChanges({
      tipoGeometria: {
        currentValue: 'Polygon',
        previousValue: '',
        firstChange: true,
        isFirstChange: () => true,
      },
    });
    expect(component.mostrarSwitchDistancia).toBeTrue();
    expect(component.mostrarSwitchArea).toBeTrue();
  });

  it('updateAreaResult debe actualizar propiedades del servicio', () => {
    component.selectedArea = { name: 'Metros Cuadrados', code: 'm2' };
    component.mostrarArea = true;
    component.updateAreaResult(100);
    expect(dibujarServiceMock.textoArea).toBe('Área: 100.00 metros cuadrados');
    expect(dibujarServiceMock.mostrarArea).toBeTrue();
  });
});
