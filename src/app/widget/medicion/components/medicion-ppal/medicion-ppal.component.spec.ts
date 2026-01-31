import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MedicionPpalComponent } from './medicion-ppal.component';
import { MedicionService } from '@app/widget/medicion/services/medicion.service';
import { Subject } from 'rxjs';

// Servicio mock para simular comportamiento sin conexión real
class MockMedicionService {
  longitudSubject = new Subject<number>();
  areaSubject = new Subject<number>();

  addInteraction(tipo: string): void {
    void tipo;
    // Simulación de agregar interacción
  }

  removeInteractions(): void {
    // Simulación de eliminación de interacciones
  }

  limpiarMedicion(): void {
    // Simulación de limpieza
  }
}

describe('MedicionPpalComponent', () => {
  let component: MedicionPpalComponent;
  let fixture: ComponentFixture<MedicionPpalComponent>;
  let servicioMock: MockMedicionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicionPpalComponent],
      providers: [{ provide: MedicionService, useClass: MockMedicionService }],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicionPpalComponent);
    component = fixture.componentInstance;
    servicioMock = TestBed.inject(MedicionService) as MockMedicionService;

    fixture.detectChanges(); // Ejecuta ngOnInit
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar las unidades por defecto', () => {
    expect(component.selectedArea?.code).toBe('km2');
    expect(component.selectedLongitud?.code).toBe('km');
  });

  it('debería cambiar el modo activo a "area" al seleccionar área', () => {
    spyOn(servicioMock, 'removeInteractions');
    spyOn(servicioMock, 'addInteraction');

    component.selectArea();

    expect(component.modoActivo).toBe('area');
    expect(servicioMock.removeInteractions).toHaveBeenCalled();
    expect(servicioMock.addInteraction).toHaveBeenCalledWith('Polygon');
  });

  it('debería cambiar el modo activo a "longitud" al seleccionar longitud', () => {
    spyOn(servicioMock, 'removeInteractions');
    spyOn(servicioMock, 'addInteraction');

    component.selectLongitud();

    expect(component.modoActivo).toBe('longitud');
    expect(servicioMock.removeInteractions).toHaveBeenCalled();
    expect(servicioMock.addInteraction).toHaveBeenCalledWith('LineString');
  });

  it('debería actualizar el resultado al recibir longitud', () => {
    component.selectedLongitud = { name: 'Kilómetros', code: 'km' };
    servicioMock.longitudSubject.next(5000); // 5 km

    expect(component.resultado).toBe('5.00 Kilómetros');
  });

  it('debería actualizar el resultado al recibir área', () => {
    component.selectedArea = { name: 'Héctareas', code: 'ha' };
    servicioMock.areaSubject.next(20000); // 2 ha

    expect(component.resultado).toBe('2.00 Héctareas');
  });

  it('debería destruir correctamente las suscripciones al destruirse', () => {
    const destroy$ = (component as { destroy$: Subject<void> }).destroy$;
    const spyNext = spyOn(destroy$, 'next').and.callThrough();
    const spyComplete = spyOn(destroy$, 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(spyNext).toHaveBeenCalled();
    expect(spyComplete).toHaveBeenCalled();
  });

  it('debería convertir longitud de metros a millas correctamente', () => {
    const result = (
      component as unknown as {
        convertirLongitud: (val: number, unit: string) => number;
      }
    ).convertirLongitud(1609.34, 'mi');
    expect(result).toBeCloseTo(1, 2);
  });

  it('debería convertir área de metros cuadrados a hectáreas correctamente', () => {
    const { areaConvertida, unidadFormateada } = (
      component as unknown as {
        convertirArea: (
          val: number,
          unit: string
        ) => { areaConvertida: number; unidadFormateada: string };
      }
    ).convertirArea(10000, 'ha');
    expect(areaConvertida).toBe(1);
    expect(unidadFormateada).toBe('ha');
  });

  it('debería recalcular el resultado cuando cambia la unidad seleccionada', () => {
    component.selectedLongitud = { name: 'Kilómetros', code: 'km' };

    // Simula la llegada del dato llamando manualmente el método
    component.updateLongitudResult(1000);

    expect(component.resultado).toBe('1.00 Kilómetros');

    // Ahora cambia la unidad y recalcula
    component.selectedLongitud = { name: 'Millas', code: 'mi' };
    component.modoActivo = 'longitud';
    component.recalcularResultado();

    expect(component.resultado).toBe('0.62 Millas');
  });

  it('debería recalcular el resultado cuando cambia la unidad de área seleccionada', () => {
    component.selectedArea = { name: 'Metros Cuadrados', code: 'm2' };

    // Simula la llegada del dato llamando el método directamente
    component.updateAreaResult(10000);

    expect(component.resultado).toBe('10000.00 Metros Cuadrados');

    // Cambiar a hectáreas
    component.selectedArea = { name: 'Héctareas', code: 'ha' };
    component.modoActivo = 'area';
    component.recalcularResultado();

    expect(component.resultado).toBe('1.00 Héctareas');
  });
});
