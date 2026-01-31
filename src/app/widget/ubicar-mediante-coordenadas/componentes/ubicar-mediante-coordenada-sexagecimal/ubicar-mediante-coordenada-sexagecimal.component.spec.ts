import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UbicarMedianteCoordenadaSexagecimalComponent } from './ubicar-mediante-coordenada-sexagecimal.component';
import { DMS } from '../../interfaces/DMS';

describe('UbicarMedianteCoordenadaSexagecimalComponent', () => {
  let component: UbicarMedianteCoordenadaSexagecimalComponent;
  let fixture: ComponentFixture<UbicarMedianteCoordenadaSexagecimalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UbicarMedianteCoordenadaSexagecimalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(
      UbicarMedianteCoordenadaSexagecimalComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('ngOnInit', () => {
    it('debería inicializar el formulario y obtener la proyección del mapa', () => {
      component.ngOnInit();

      expect(component.sexagesimalForm.contains('longitudeDegrees')).toBeTrue();
      expect(component.sexagesimalForm.contains('longitudeMinutes')).toBeTrue();
      expect(component.sexagesimalForm.contains('longitudeSeconds')).toBeTrue();
      expect(component.sexagesimalForm.contains('latitudeDegrees')).toBeTrue();
      expect(component.sexagesimalForm.contains('latitudeMinutes')).toBeTrue();
      expect(component.sexagesimalForm.contains('latitudeSeconds')).toBeTrue();
    });
  });

  describe('On Convert DMS to Coordinate', () => {
    it('Convertir Grados positivos , Minutos y Segundos a punto de coordenada', () => {
      const result = 34.2583;
      const coordenada = component.convertDGSToCoordinate(34, 15, 30);
      expect(coordenada).toEqual(result);
    });

    it('Convertir Grados negativos , Minutos y Segundos a punto de coordenada', () => {
      const otherResult = -73.5133;
      const coordenada = component.convertDGSToCoordinate(-73, 30, 48);
      expect(coordenada).toEqual(otherResult);
    });

    it('Convertir Grados postivos , Minutos y Segundos en cero a punto de coordenada', () => {
      const result = 73;
      const coordenada = component.convertDGSToCoordinate(73, 0, 0);
      expect(coordenada).toEqual(result);
    });
  });

  describe('On trunc decimals', () => {
    it('Truncar decimales a 4 digitos', () => {
      const result = 12.3456;
      const truncatedNumber = component.truncDecimal(12.3456789, 4);
      expect(truncatedNumber).toEqual(result);
    });
  });

  describe('on Submit Form', () => {
    it('deberia emitir la coordenada', () => {
      spyOn(component.coordinateEmitter, 'emit'); // Espiamos el método emit()
      component.sexagesimalForm.setValue({
        longitudeDegrees: 73,
        longitudeMinutes: 30,
        longitudeSeconds: 48,
        latitudeDegrees: 5,
        latitudeMinutes: 56,
        latitudeSeconds: 15,
        longitudeHemisphere: { name: 'E', value: 'E' },
        latitudeHemisphere: { name: 'N', value: 'N' },
      });

      component.onSubmit();

      expect(component.coordinateEmitter.emit).toHaveBeenCalled(); // Verificamos
    });

    it('deberia no llamar al emisor de coordenadas porque hay error en el formulario', () => {
      // Espiamos los métodos
      spyOn(component.coordinateEmitter, 'emit');

      component.sexagesimalForm.setValue({
        longitudeDegrees: null,
        longitudeMinutes: null,
        longitudeSeconds: null,
        latitudeDegrees: null,
        latitudeMinutes: null,
        latitudeSeconds: null,
        longitudeHemisphere: { name: 'E', value: 'E' },
        latitudeHemisphere: { name: 'N', value: 'N' },
      });

      component.onSubmit();

      // Esperamos que NO emita
      expect(component.coordinateEmitter.emit).not.toHaveBeenCalled();
    });

    it('deberia convertir coordenada decimal a DMS', () => {
      // Espiamos los métodos
      spyOn(component.coordinateEmitter, 'emit');

      const coordinateDMS: DMS = {
        direccion: 'N',
        grados: 5,
        minutos: 2,
        segundos: 15.5,
      };
      const transformed = component.convertirADMS(5.037639, 'latitud');
      expect(transformed).toEqual(coordinateDMS);
    });
  });
});
