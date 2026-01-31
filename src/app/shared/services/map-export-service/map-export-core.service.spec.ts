// map-export-core.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { MapExportCoreService } from './map-export-core.service';
import { MapService } from '@app/core/services/map-service/map.service';
import { MapState } from '@app/core/interfaces/store/map.model';
import { selectProxyURL } from '@app/core/store/map/map.selectors';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';

import Map from 'ol/Map';
import View from 'ol/View';
import LayerGroup from 'ol/layer/Group';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import TileWMS from 'ol/source/TileWMS';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style } from 'ol/style';
import ImageLayer from 'ol/layer/Image';

describe('MapExportCoreService', () => {
  let service: MapExportCoreService;
  let mapServiceSpy: jasmine.SpyObj<MapService>;

  // helpers DOM
  const makeHost = (w = 256, h = 256) => {
    const host = document.createElement('div');
    host.style.width = `${w}px`;
    host.style.height = `${h}px`;
    document.body.appendChild(host);
    return host;
  };
  const removeHost = (el?: HTMLElement | null) => {
    if (el?.parentNode) el.parentNode.removeChild(el);
  };

  beforeEach(() => {
    mapServiceSpy = jasmine.createSpyObj<MapService>(
      'MapService',
      [
        'getMap',
        'createMap',
        'getLayerGroupByName',
        'addLayer',
        'removeLayer',
        'showOrHideLayer',
        'generateTransparency',
        'identify',
        'getLayerByDefinition',
      ],
      { map: null }
    );

    const initialState = {
      map: { proxyUrl: 'http://proxy.local/?url=' },
    } as unknown as MapState;

    TestBed.configureTestingModule({
      providers: [
        MapExportCoreService,
        { provide: MapService, useValue: mapServiceSpy },
        provideMockStore<MapState>({
          initialState,
          selectors: [
            { selector: selectProxyURL, value: 'http://proxy.local/?url=' },
          ],
        }),
      ],
    });

    service = TestBed.inject(MapExportCoreService);

    // Tipo auxiliar solo para el spy (firma flexible para no pelear con TS)
    interface DecodeImageHost {
      decodeImage: (...args: unknown[]) => Promise<unknown>;
    }

    spyOn(service as unknown as DecodeImageHost, 'decodeImage').and.returnValue(
      Promise.resolve()
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('createCleanMap: clona center y aplica zoomFactor a la resolution, agrega base + vector extra', () => {
    // mapa original del visor
    const host0 = makeHost();
    const original = new Map({
      target: host0,
      view: new View({
        projection: 'EPSG:3857',
        center: [10, 20],
        resolution: 5,
      }),
      layers: [],
      controls: [],
      interactions: [],
    });
    mapServiceSpy.getMap.and.returnValue(original);

    // capa vector extra
    const src = new VectorSource({
      features: [new Feature({ geometry: new Point([1, 2]) })],
    });
    const extraVector = new VectorLayer({ source: src });

    // mapa limpio
    const host1 = makeHost();
    const clean = service.createCleanMap(host1, [0, 0, 0, 0], 'EPSG:3857', [
      extraVector,
    ]);

    expect(clean).toBeTruthy();
    const v = clean.getView();
    expect(v.getCenter()).toEqual([10, 20]);

    // resolution debe ser resolución original * zoomFactor (0.65)
    const expectedResolution = 5 * 0.65;
    expect(v.getResolution()).toBeCloseTo(expectedResolution, 6);

    // debe tener base OSM + nuestra capa vector
    const arr = clean.getLayers().getArray();
    expect(arr.length).toBe(2);
    expect(arr[1]).toBe(extraVector); // misma instancia

    removeHost(host0);
    removeHost(host1);
  });

  it('getIntermediateAndUpperLayers: devuelve solo hijos de INTERMEDIATE y UPPER', () => {
    const host = makeHost();

    const L1 = new TileLayer();
    const L2 = new VectorLayer({ source: new VectorSource() });
    const L3 = new TileLayer();

    const gIntermediate = new LayerGroup({ layers: [L1] });
    const gUpper = new LayerGroup({ layers: [L2, L3] });

    // Asegura el nombre como lo espera el servicio
    gIntermediate.set('name', LayerLevel.INTERMEDIATE);
    gUpper.set('name', LayerLevel.UPPER);

    const mainMap = new Map({
      target: host,
      view: new View({
        projection: 'EPSG:3857',
        center: [0, 0],
        resolution: 1,
      }),
      layers: [gIntermediate, gUpper],
      controls: [],
      interactions: [],
    });

    // getter para que el servicio lea el mapa correcto
    Object.defineProperty(mapServiceSpy, 'map', {
      get: () => mainMap,
      configurable: true,
    });
    mapServiceSpy.getMap.and.returnValue(mainMap);

    const result = service.getIntermediateAndUpperLayers();

    expect(result.length).toBe(3);
    expect(result).toContain(L1);
    expect(result).toContain(L2);
    expect(result).toContain(L3);

    removeHost(host);
  });

  it('getVisibleWFSLayers: filtra por wfs + urlServicioWFS + nombre + visible', () => {
    const wmsLike = new TileLayer({
      properties: {
        id: 'layer-id',
        nombre: 'layerName',
        titulo: 'Layer Título',
        urlServicioWFS: 'http://wfs-url',
        wfs: true,
      },
    });
    wmsLike.setVisible(true);

    const hidden = new TileLayer({
      properties: {
        nombre: 'hidden',
        urlServicioWFS: 'http://wfs-url',
        wfs: true,
      },
    });
    hidden.setVisible(false);

    const out = service.getVisibleWFSLayers([wmsLike, hidden]);
    expect(out.length).toBe(1);
    expect(out[0]).toEqual(
      jasmine.objectContaining({
        id: 'layer-id',
        nombre: 'layerName',
        urlServicioWFS: 'http://wfs-url',
        wfs: true,
        leaf: true,
      })
    );
  });

  it('loadExportMapLayers: agrega un VectorLayer clonado al mapa limpio', async () => {
    // mapa original para createCleanMap (aunque loadExportMapLayers ya no lo usa)
    mapServiceSpy.getMap.and.returnValue(
      new Map({
        target: makeHost(),
        view: new View({
          projection: 'EPSG:3857',
          center: [0, 0],
          resolution: 1,
        }),
        layers: [],
        controls: [],
        interactions: [],
      })
    );
    const host = makeHost(300, 200);
    const clean = service.createCleanMap(host, [0, 0, 0, 0], 'EPSG:3857'); // solo base

    // capa vector ORIGINAL (no está en el clean)
    const src = new VectorSource({
      features: [new Feature({ geometry: new Point([3, 4]) })],
    });
    const vectorOriginal = new VectorLayer({
      source: src,
      style: new Style(), // mantiene estilo
      opacity: 0.7,
      visible: true,
    });

    await service.loadExportMapLayers(clean, [vectorOriginal]);

    const added = clean
      .getLayers()
      .getArray()
      .find(l => l instanceof VectorLayer) as VectorLayer;
    expect(added).toBeTruthy();
    // debe ser una instancia nueva (clonada), no la misma
    expect(added).not.toBe(vectorOriginal);

    const addedSrc = added.getSource() as VectorSource;
    expect(addedSrc.getFeatures().length).toBe(1);
    expect(added.getOpacity()).toBeCloseTo(0.7, 5);
    expect(added.getVisible()).toBeTrue();

    removeHost(host);
  });

  it('loadExportMapLayers: WMS → agrega ImageLayer (mock fetch/URL)', async () => {
    // mapa original para createCleanMap
    const host0 = makeHost();
    mapServiceSpy.getMap.and.returnValue(
      new Map({
        target: host0,
        view: new View({
          projection: 'EPSG:3857',
          center: [0, 0],
          resolution: 1,
        }),
        layers: [],
        controls: [],
        interactions: [],
      })
    );

    const host = makeHost(256, 256);
    const clean = service.createCleanMap(host, [0, 0, 0, 0], 'EPSG:3857');

    // capa WMS de origen
    const wms = new TileWMS({
      url: 'http://example.com/wms',
      params: { LAYERS: 'foo' },
      crossOrigin: 'anonymous',
    });

    // Asegura que getUrls() retorne algo
    spyOn(wms, 'getUrls').and.returnValue(['http://example.com/wms']);

    const tile = new TileLayer({ source: wms, visible: true, opacity: 0.8 });

    spyOn(window, 'fetch').and.callFake(
      async (
        _input: RequestInfo | URL,
        _init?: RequestInit
      ): Promise<Response> => {
        void _input;
        void _init;
        return {
          ok: true,
          blob: async () =>
            new Blob([new Uint8Array([137, 80, 78, 71])], {
              type: 'image/png',
            }),
        } as unknown as Response;
      }
    );

    // mock URL
    spyOn(URL, 'createObjectURL').and.returnValue('blob:fake-url');

    await service.loadExportMapLayers(clean, [tile]);

    const layers = clean.getLayers().getArray();

    // Debe existir una ImageLayer agregada además de la base (TileLayer)
    const hasImageLayer = layers.some(l => l instanceof ImageLayer);
    expect(hasImageLayer).toBeTrue();

    removeHost(host0);
    removeHost(host);
  });
});
