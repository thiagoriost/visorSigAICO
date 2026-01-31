import { TestBed } from '@angular/core/testing';
import { MapaBaseService } from './mapa-base.service';
import { MapasBase } from '@app/core/interfaces/enums/MapasBase.enum';
import TileLayer from 'ol/layer/Tile';
import { MapaBaseInterface } from '@app/shared/Interfaces/mapa-base/mapa-base-interface';

describe('MapaBaseService', () => {
  let service: MapaBaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MapaBaseService],
    });
    service = TestBed.inject(MapaBaseService);
  });

  it('debería crearse el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('getMapBases', () => {
    let mapBases: MapaBaseInterface[];

    beforeEach(() => {
      mapBases = service.getMapBases();
    });

    it('debería retornar un arreglo de mapas base', () => {
      expect(Array.isArray(mapBases)).toBeTrue();
      expect(mapBases.length).toBeGreaterThan(0);
    });

    it('cada elemento debería tener nombre, título y capa instanciada', () => {
      mapBases.forEach(base => {
        expect(base.name).toBeDefined();
        expect(typeof base.title).toBe('string');
        expect(base.layer instanceof TileLayer).toBeTrue();
      });
    });

    it('las capas deberían tener una fuente con url definida', () => {
      mapBases.forEach(base => {
        const source: unknown = base.layer.getSource();
        expect(source).toBeDefined();
        if (
          source &&
          typeof (source as { getUrls?: () => string[] }).getUrls === 'function'
        ) {
          const urls = (source as { getUrls: () => string[] }).getUrls();
          expect(urls.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('getLayerByName', () => {
    it('debería retornar una capa válida cuando el nombre existe', () => {
      const layer = service.getLayerByName(MapasBase.GOOGLE_SATELLITE);
      expect(layer).toBeInstanceOf(TileLayer);
    });

    it('debería retornar null cuando el nombre no existe', () => {
      const layer = service.getLayerByName('MAPA_INEXISTENTE' as MapasBase);
      expect(layer).toBeNull();
    });
  });

  describe('getAllMapOptions', () => {
    it('debería retornar un arreglo con opciones válidas', () => {
      const options = service.getAllMapOptions();
      expect(Array.isArray(options)).toBeTrue();
      expect(options.length).toBeGreaterThan(0);

      options.forEach(opt => {
        expect(typeof opt.label).toBe('string');
        expect(Object.values(MapasBase)).toContain(opt.value);
      });
    });
  });

  describe('getFilteredMapOptions', () => {
    it('debería filtrar correctamente por mapas de Google', () => {
      const googleOptions = service.getFilteredMapOptions(opt =>
        opt.value.toString().startsWith('google')
      );

      expect(googleOptions.length).toBeGreaterThan(0);
      googleOptions.forEach(opt => {
        expect(opt.value.toString().startsWith('google')).toBeTrue();
      });
    });

    it('debería retornar todas las opciones si no se pasa un filtro', () => {
      const options = service.getFilteredMapOptions(() => true);
      const allOptions = service.getAllMapOptions();
      expect(options.length).toEqual(allOptions.length);
    });
  });
});
