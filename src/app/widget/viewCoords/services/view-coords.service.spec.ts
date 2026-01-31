import { MapService } from '@app/core/services/map-service/map.service';
import { ViewCoordsService } from './view-coords.service';

describe('ViewCoordsService', () => {
  let service: ViewCoordsService;
  let mockMapService: jasmine.SpyObj<MapService>;

  beforeEach(() => {
    // Arrange: crear un mock del MapService
    mockMapService = jasmine.createSpyObj('MapService', ['getMap']);

    // Crear la instancia del servicio inyectando el mock
    service = new ViewCoordsService(mockMapService);
  });

  it('debería estar definido el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debería convertir latitud positiva a formato DMS', () => {
    // Arrange
    const decimal = 4.7109886;
    const isLat = true;

    // Act
    const result = service.decimalToDMS(decimal, isLat);

    // Assert
    expect(result).toBe('4° 42\' 40" N');
  });

  it('debería convertir longitud negativa a formato DMS', () => {
    // Arrange
    const decimal = -74.072092;
    const isLat = false;

    // Act
    const result = service.decimalToDMS(decimal, isLat);

    // Assert
    expect(result).toBe('74° 4\' 20" W');
  });

  it('debería convertir latitud negativa a DMS', () => {
    const result = service.decimalToDMS(-10.25, true);
    expect(result).toBe('10° 15\' 0" S');
  });

  it('debería convertir longitud positiva a DMS', () => {
    const result = service.decimalToDMS(45.6789, false);
    expect(result).toBe('45° 40\' 44" E');
  });
});
