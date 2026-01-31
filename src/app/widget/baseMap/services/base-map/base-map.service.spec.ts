import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { BaseMapService } from './base-map.service';
import { MapService } from '@app/core/services/map-service/map.service';
import { MapaBaseService } from '@app/shared/services/mapa-base/mapa-base.service';
import { CapaMapaBase } from '@app/core/interfaces/CapaMapaBase';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { MapaBaseInterface } from '@app/shared/Interfaces/mapa-base/mapa-base-interface';
import TileLayer from 'ol/layer/Tile';
import TileArcGISRest from 'ol/source/TileArcGISRest';
import XYZ from 'ol/source/XYZ';
import { MapasBase } from '@app/core/interfaces/enums/MapasBase.enum';

// ==== Mocks ====
class MockMapService {
  private layers: TileLayer[] = [];

  getLayerGroupByName(name: LayerLevel) {
    if (name === LayerLevel.BASE) {
      return {
        getLayers: () => ({
          item: (index: number) => this.layers[index],
          push: (layer: TileLayer) => this.layers.push(layer),
          remove: (layer: TileLayer) => {
            this.layers = this.layers.filter(l => l !== layer);
          },
        }),
      };
    }
    return null;
  }
}

class MockStore {
  dispatch = jasmine.createSpy('dispatch');
}

class MockMapaBaseService {
  private baseList: MapaBaseInterface[] = [];

  getMapBases(): MapaBaseInterface[] {
    return this.baseList;
  }

  setMapBases(list: MapaBaseInterface[]): void {
    this.baseList = list;
  }
}
describe('BaseMapService', () => {
  let service: BaseMapService;
  let mapService: MockMapService;
  let mapaBaseService: MockMapaBaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BaseMapService,
        { provide: MapService, useClass: MockMapService },
        { provide: Store, useClass: MockStore },
        { provide: MapaBaseService, useClass: MockMapaBaseService },
      ],
    });

    service = TestBed.inject(BaseMapService);
    mapService = TestBed.inject(MapService) as unknown as MockMapService;
    mapaBaseService = TestBed.inject(
      MapaBaseService
    ) as unknown as MockMapaBaseService;
  });

  // === PRUEBAS ===
  it('debería crear el servicio correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debería mostrar un error si la capa base no tiene una URL válida', () => {
    const consoleSpy = spyOn(console, 'error');
    const mapa: CapaMapaBase = {
      id: '1',
      titulo: 'Mapa sin URL',
      leaf: true,
      thumbnail: '',
      url: '',
    };

    service.changeBaseLayer(mapa);

    expect(consoleSpy).toHaveBeenCalledWith(
      '[BaseMapService] La capa base "Mapa sin URL" no tiene una URL válida.'
    );
  });

  it('debería mostrar una advertencia si no se encuentra el grupo de capas BASE', () => {
    const consoleSpy = spyOn(console, 'warn');
    spyOn(mapService, 'getLayerGroupByName').and.returnValue(null);

    const mapa: CapaMapaBase = {
      id: 'none',
      titulo: 'Mapa inválido',
      leaf: true,
      thumbnail: '',
      url: 'https://no-group.com/{z}/{x}/{y}.png',
    };

    service.changeBaseLayer(mapa);

    expect(consoleSpy).toHaveBeenCalledWith(
      '[BaseMapService] No se encontró el grupo de capas BASE.'
    );
  });

  it('debería convertir correctamente un mapa de tipo XYZ a CapaMapaBase', () => {
    const xyzSource = new XYZ({ url: 'https://xyz.test/{z}/{x}/{y}.png' });
    const xyzLayer = new TileLayer({ source: xyzSource });

    const mapa: MapaBaseInterface = {
      name: MapasBase.ESRI_STANDARD,
      title: 'OSM',
      layer: xyzLayer,
    };
    mapaBaseService.setMapBases([mapa]);

    const result = service.mapToCapaMapaBase(mapa);

    expect(result.url).toContain('https://xyz.test');
    expect(result.titulo).toBe('OSM');
  });

  it('debería normalizar correctamente la URL de servicios ArcGIS REST', () => {
    const arcgisSource = new TileArcGISRest({
      url: 'https://arcgis.test/MapServer/tile/{z}/{y}/{x}',
    });
    const arcgisLayer = new TileLayer({ source: arcgisSource });
    const mapa: MapaBaseInterface = {
      name: MapasBase.ESRI_STANDARD,
      title: 'ArcGIS',
      layer: arcgisLayer,
    };
    mapaBaseService.setMapBases([mapa]);

    const result = service.mapToCapaMapaBase(mapa);

    expect(result.url).toBe('https://arcgis.test/MapServer');
  });

  it('debería convertir una lista completa de mapas base correctamente', () => {
    const xyzLayer = new TileLayer({
      source: new XYZ({ url: 'https://a/{z}/{x}/{y}.png' }),
    });
    const arcgisLayer = new TileLayer({
      source: new TileArcGISRest({ url: 'https://b/MapServer' }),
    });

    const lista: MapaBaseInterface[] = [
      { name: MapasBase.ESRI_STANDARD, title: 'Mapa A', layer: xyzLayer },
      { name: MapasBase.ESRI_GRAY_DARK, title: 'Mapa B', layer: arcgisLayer },
    ];
    mapaBaseService.setMapBases(lista);

    const resultado = service.mapListToCapaMapaBase(lista);

    expect(resultado.length).toBe(2);
    expect(resultado[0].titulo).toBe('Mapa A');
    expect(resultado[1].url).toContain('MapServer');
  });
});
