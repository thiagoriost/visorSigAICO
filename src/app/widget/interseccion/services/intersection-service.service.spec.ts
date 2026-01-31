import { TestBed } from '@angular/core/testing';
import { IntersectionServiceService } from './intersection-service.service';
import { MapService } from '@app/core/services/map-service/map.service';
import { provideMockStore } from '@ngrx/store/testing';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { FeatureCollection } from 'geojson';
import { selectProxyURL } from '@app/core/store/map/map.selectors';
import OlMap from 'ol/Map';
import Collection from 'ol/Collection';

describe('IntersectionServiceService', () => {
  let service: IntersectionServiceService;
  let mapServiceSpy: jasmine.SpyObj<MapService>;
  const emptyLayers = new Collection<VectorLayer>([]);

  const fakeMap = {
    getLayers(): Collection<VectorLayer> {
      return emptyLayers;
    },
  } as unknown as OlMap;

  const initialState = { proxyURL: 'http://proxy/' };

  beforeEach(() => {
    mapServiceSpy = jasmine.createSpyObj('MapService', [
      'getMap',
      'getLayerGroupByName',
    ]);

    TestBed.configureTestingModule({
      providers: [
        IntersectionServiceService,
        { provide: MapService, useValue: mapServiceSpy },
        provideMockStore({
          selectors: [
            { selector: selectProxyURL, value: initialState.proxyURL },
          ],
        }),
      ],
    });

    service = TestBed.inject(IntersectionServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set proxyUrl from store selector', () => {
    expect(service.proxyUrl).toBe(initialState.proxyURL);
  });

  describe('getGeoJsonFromFileLayer', () => {
    const dummyLayer: CapaMapa = {
      id: 'file1',
      titulo: 'File Layer',
      tipoServicio: 'FILE',
    } as CapaMapa;

    it('should reject if no map', async () => {
      mapServiceSpy.getMap.and.returnValue(null);
      await expectAsync(
        service.getGeoJsonFromFileLayer(dummyLayer)
      ).toBeRejectedWithError('No hay mapa disponible');
    });

    it('should reject if layer not found', async () => {
      mapServiceSpy.getMap.and.returnValue(fakeMap);

      await expectAsync(
        service.getGeoJsonFromFileLayer(dummyLayer)
      ).toBeRejectedWithError(
        `No se encontró la capa vectorial con ID ${dummyLayer.id}`
      );
    });

    it('should reject if no features', async () => {
      const layer = new VectorLayer({ source: new VectorSource() });
      layer.set('id', dummyLayer.id);
      mapServiceSpy.getMap.and.returnValue({
        getLayers: () => ({ getArray: () => [layer] }),
      } as unknown as OlMap);
      await expectAsync(
        service.getGeoJsonFromFileLayer(dummyLayer)
      ).toBeRejectedWithError(
        `La capa ${dummyLayer.titulo} no tiene geometrías`
      );
    });

    it('should return GeoJSON when features exist', async () => {
      const source = new VectorSource();
      const feature = new Feature(new Point([0, 0]));
      source.addFeature(feature);
      const layer = new VectorLayer({ source });
      layer.set('id', dummyLayer.id);
      layer.set('titulo', dummyLayer.titulo);

      mapServiceSpy.getMap.and.returnValue({
        getLayers: () => ({ getArray: () => [layer] }),
      } as unknown as OlMap);

      const result = await service.getGeoJsonFromFileLayer(dummyLayer);
      expect((result as FeatureCollection).features.length).toBe(1);
    });
  });

  describe('getGeoJsonFromRestLayer', () => {
    const restLayer = {
      tipoServicio: 'REST',
      urlServicioWFS: 'http://test/',
      nombre: 'layer1',
    } as CapaMapa;
    let fetchSpy: jasmine.Spy;

    beforeEach(() => {
      fetchSpy = spyOn(window, 'fetch');
    });

    it('should reject when missing info', async () => {
      const bad = { tipoServicio: 'REST' } as CapaMapa;
      await expectAsync(
        service.getGeoJsonFromRestLayer(bad)
      ).toBeRejectedWithError('La capa REST/WMS no tiene información completa');
    });

    it('should fetch and return features', async () => {
      const dummyGeojson: FeatureCollection = {
        type: 'FeatureCollection',
        features: [],
      };
      const response = new Response(JSON.stringify(dummyGeojson), {
        status: 200,
      });
      fetchSpy.and.returnValue(Promise.resolve(response));

      const result = await service.getGeoJsonFromRestLayer(restLayer);
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://test/?service=WFS&version=1.1.0&request=GetFeature&typeName=layer1&outputFormat=application/json'
      );
      expect(result).toEqual(dummyGeojson);
    });

    it('should throw on network error', async () => {
      fetchSpy.and.returnValue(
        Promise.resolve(new Response('', { status: 500, statusText: 'Error' }))
      );
      await expectAsync(
        service.getGeoJsonFromRestLayer(restLayer)
      ).toBeRejectedWithError(/Error al obtener GeoJSON de layer1/);
    });
  });
});
