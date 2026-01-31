import { TestBed } from '@angular/core/testing';
import { ViewCoordsService } from '../../services/view-coords.service';

describe('ViewCoordsService', () => {
  let service: ViewCoordsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ViewCoordsService],
    });

    service = TestBed.inject(ViewCoordsService);
  });

  describe('decimalToDMS', () => {
    it('debería crear la instancia del servicio', () => {
      expect(service).toBeTruthy();
    });

    it('debería convertir latitud positiva a formato DMS', () => {
      const result = service.decimalToDMS(4.7109886, true);
      expect(result).toBe('4° 42\' 40" N');
    });

    it('debería convertir longitud negativa a formato DMS', () => {
      const result = service.decimalToDMS(-74.072092, false);
      expect(result).toBe('74° 4\' 20" W');
    });
  });
});
