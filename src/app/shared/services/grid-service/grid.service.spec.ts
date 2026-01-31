import { TestBed } from '@angular/core/testing';
import { GridService } from './grid.service';
import { MapService } from '@app/core/services/map-service/map.service';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

import type OlMap from 'ol/Map';
import type LayerGroup from 'ol/layer/Group';

// ---- helpers de doble para el grupo UPPER ----
type LayerLike = unknown;

interface FakeLayerCollection<T = LayerLike> {
  getArray(): T[];
  push(layer: T): void;
  remove(layer: T): void;
}

interface FakeLayerGroup<T = LayerLike> {
  getLayers(): FakeLayerCollection<T>;
  /** Solo para inspección en tests */
  _bag: { layers: T[] };
}

function makeFakeLayerGroup<T = LayerLike>(): FakeLayerGroup<T> {
  const bag: { layers: T[] } = { layers: [] };
  return {
    getLayers: (): FakeLayerCollection<T> => ({
      getArray: () => bag.layers,
      push: (l: T) => {
        bag.layers.push(l);
      },
      remove: (l: T) => {
        const i = bag.layers.indexOf(l);
        if (i > -1) bag.layers.splice(i, 1);
      },
    }),
    _bag: bag,
  };
}

describe('GridService', () => {
  let service: GridService;

  // Doble de MapService con lo necesario para estos tests
  const mapServiceSpy = jasmine.createSpyObj<MapService>(
    'MapService',
    ['getMap', 'getLayerGroupByName'],
    { map: null }
  );

  // Tipos para el stub de mapa (solo lo que usa el servicio)
  type MoveEndHandler = () => void;
  interface MapStub {
    on: jasmine.Spy<(evt: 'moveend', cb: MoveEndHandler) => void>;
    un: jasmine.Spy<(evt: 'moveend', cb: MoveEndHandler) => void>;
    getView: () => { calculateExtent: () => [number, number, number, number] };
    getSize: () => [number, number];
    _handlers: Record<'moveend', MoveEndHandler[]>;
  }

  // Mapa mínimo con API de eventos y view/size
  const makeMapStub = (): MapStub => {
    const handlers: Record<'moveend', MoveEndHandler[]> = { moveend: [] };
    return {
      on: jasmine
        .createSpy('on')
        .and.callFake((evt: 'moveend', cb: MoveEndHandler) => {
          handlers[evt].push(cb);
        }),
      un: jasmine
        .createSpy('un')
        .and.callFake((evt: 'moveend', cb: MoveEndHandler) => {
          const list = handlers[evt];
          const i = list.indexOf(cb);
          if (i > -1) list.splice(i, 1);
        }),
      getView: () => ({
        // no usamos el size aquí, devolvemos extent fijo
        calculateExtent: () => [0, 0, 10, 10],
      }),
      getSize: () => [100, 100] as [number, number],
      _handlers: handlers,
    };
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GridService,
        { provide: MapService, useValue: mapServiceSpy },
      ],
    });
    service = TestBed.inject(GridService);

    // reset de spies por test
    mapServiceSpy.getMap.calls.reset();
    mapServiceSpy.getLayerGroupByName.calls.reset();
  });

  it('should be created (smoke)', () => {
    expect(service).toBeTruthy();
  });

  describe('createGridLayer()', () => {
    it('crea una VectorLayer no visible con fuente', () => {
      const layer = service.createGridLayer([0, 0, 10, 10]);
      expect(layer).toEqual(jasmine.any(VectorLayer));
      expect(layer.getVisible()).toBeFalse();
      expect(layer.getSource()).toEqual(jasmine.any(VectorSource));
      // no validamos cantidad de features (frágil); solo que haya alguna
      const feats = (layer.getSource() as VectorSource).getFeatures();
      expect(Array.isArray(feats)).toBeTrue();
      expect(feats.length).toBeGreaterThan(0);
    });
  });

  describe('ensureGridLayer()', () => {
    it('reusa la misma instancia y actualiza features en llamadas subsecuentes', () => {
      const l1 = service.ensureGridLayer([0, 0, 10, 10]);
      const src1 = l1.getSource() as VectorSource;
      const clearSpy = spyOn(src1, 'clear').and.callThrough();
      const addSpy = spyOn(src1, 'addFeatures').and.callThrough();

      const l2 = service.ensureGridLayer([0, 0, 5, 5]);
      expect(l2).toBe(l1);
      expect(clearSpy).toHaveBeenCalled();
      expect(addSpy).toHaveBeenCalledWith(jasmine.any(Array));
    });
  });

  describe('setGridVisibility() / getGridLayer()', () => {
    it('getGridLayer() es null antes de crear; visibilidad se respeta', () => {
      expect(service.getGridLayer()).toBeNull();

      const layer = service.createGridLayer([0, 0, 10, 10]);
      expect(service.getGridLayer()).toBe(layer);

      // inicia invisible
      expect(layer.getVisible()).toBeFalse();

      service.setGridVisibility(true);
      expect(layer.getVisible()).toBeTrue();

      service.setGridVisibility(false);
      expect(layer.getVisible()).toBeFalse();
    });
  });

  describe('updateGridLayer()', () => {
    it('si existe capa, reemplaza su source por una VectorSource nueva', () => {
      const layer = service.createGridLayer([0, 0, 10, 10]);

      // Espiamos setSource sin recurrir a any
      interface HasSetSource {
        setSource(src: VectorSource): void;
      }
      const setSourceSpy = spyOn(
        layer as unknown as HasSetSource,
        'setSource'
      ).and.callThrough();

      service.updateGridLayer([0, 0, 3, 3]);
      expect(setSourceSpy).toHaveBeenCalledWith(jasmine.any(VectorSource));
    });

    it('si no existe capa, no falla', () => {
      // No hay gridLayer creada
      expect(() => service.updateGridLayer([0, 0, 2, 2])).not.toThrow();
    });
  });

  describe('makeStandaloneGridLayer()', () => {
    it('crea capa visible con nombre "exportGridLayer" y con features', () => {
      const layer = service.makeStandaloneGridLayer([0, 0, 10, 10], {
        idealCells: 16,
        color: 'rgba(0,0,0,0.3)',
        width: 2,
        expandBy: 3,
      });

      expect(layer).toEqual(jasmine.any(VectorLayer));
      expect(layer.getVisible()).toBeTrue();
      expect(layer.get('name')).toBe('exportGridLayer');

      const feats = (layer.getSource() as VectorSource).getFeatures();
      expect(feats.length).toBeGreaterThan(0);
    });
  });

  describe('prepareGridLayer() / closeGridLayer()', () => {
    it('inyecta en UPPER, gestiona listeners y luego limpia correctamente', () => {
      const mapStub = makeMapStub();
      const upperGroup = makeFakeLayerGroup<VectorLayer>();

      mapServiceSpy.getMap.and.returnValue(mapStub as unknown as OlMap);
      mapServiceSpy.getLayerGroupByName.and.callFake((name: LayerLevel) =>
        name === LayerLevel.UPPER ? (upperGroup as unknown as LayerGroup) : null
      );

      // Con exportExtent: no registra "on", solo hace "un"
      service.prepareGridLayer(true, [0, 0, 5, 5], { idealCells: 8 });

      // se inyecta exactamente 1 capa
      expect(upperGroup._bag.layers.length).toBe(1);
      const grid = upperGroup._bag.layers[0] as VectorLayer;
      expect(grid).toEqual(jasmine.any(VectorLayer));
      expect(grid.getVisible()).toBeTrue();
      expect(mapStub.un).toHaveBeenCalledWith('moveend', jasmine.any(Function));
      expect(mapStub.on).not.toHaveBeenCalled();

      // close: oculta, desuscribe y retira del grupo dejando referencia en null
      service.closeGridLayer();
      expect(grid.getVisible()).toBeFalse(); // se ocultó antes de quitar
      expect(upperGroup._bag.layers.length).toBe(0);
      expect(service.getGridLayer()).toBeNull();
      expect(mapStub.un).toHaveBeenCalledWith('moveend', jasmine.any(Function));
    });

    it('sin exportExtent: registra listener en moveend', () => {
      const mapStub = makeMapStub();
      const upperGroup = makeFakeLayerGroup<VectorLayer>();
      mapServiceSpy.getMap.and.returnValue(mapStub as unknown as OlMap);
      mapServiceSpy.getLayerGroupByName.and.returnValue(
        upperGroup as unknown as LayerGroup
      );

      service.prepareGridLayer(true /* visible */);
      expect(mapStub.on).toHaveBeenCalledWith('moveend', jasmine.any(Function));
      expect(upperGroup._bag.layers.length).toBe(1);

      service.closeGridLayer();
      expect(upperGroup._bag.layers.length).toBe(0);
    });
  });
});
