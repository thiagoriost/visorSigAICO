import { TestBed } from '@angular/core/testing';
import { LocateCoordinateService } from './locate-coordinate.service';
import { MapService } from '@app/core/services/map-service/map.service';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import VectorLayer from 'ol/layer/Vector';
import LayerGroup from 'ol/layer/Group';
import { Collection, View } from 'ol';
import BaseLayer from 'ol/layer/Base';
import { Map as OlMap } from 'ol';

describe('LocateCoordinateService', () => {
  let service: LocateCoordinateService;
  let mockMapService: jasmine.SpyObj<MapService>;

  beforeEach(() => {
    mockMapService = jasmine.createSpyObj('MapService', [
      'getLayerGroupByName',
      'getMap',
    ]);

    TestBed.configureTestingModule({
      providers: [
        LocateCoordinateService,
        { provide: MapService, useValue: mockMapService },
      ],
    });

    service = TestBed.inject(LocateCoordinateService);
  });

  it('should create correctly', () => {
    expect(service).toBeTruthy();
  });

  describe('addPointToMap', () => {
    it('deberia agregar una capa con un punto al grupo de capas superiores', () => {
      const pushSpy = jasmine.createSpy('push');
      const mockLayerCollection: Collection<BaseLayer> =
        new Collection<BaseLayer>();
      mockLayerCollection.push = pushSpy;
      const mockLayerGroup = {
        getLayers: (): Collection<BaseLayer> => mockLayerCollection,
      };

      mockMapService.getLayerGroupByName.and.returnValue(
        mockLayerGroup as LayerGroup
      );

      service.addPointToMap([10, 20], 'test-id');
      expect(mockMapService.getLayerGroupByName).toHaveBeenCalledWith(
        LayerLevel.UPPER
      );
      expect(pushSpy).toHaveBeenCalled();
    });
  });

  describe('centerMapOnPoint', () => {
    it('deberia centrar y hacer zoom en las coordenadas dadas', () => {
      const mockView = {
        getZoom: () => 5,
        setCenter: jasmine.createSpy('setCenter') as (
          coordiantes: [number, number]
        ) => void,
        setZoom: jasmine.createSpy('setZoom') as (zoom: number) => void,
      };
      const mockMap: Partial<OlMap> = {
        getView: () => mockView as View,
      };
      mockMapService.getMap.and.returnValue(mockMap as OlMap);
      service.centerMapOnPoint([30, 40], 2);

      expect(mockMapService.getMap).toHaveBeenCalled();
      expect(mockView.setCenter).toHaveBeenCalledWith([30, 40]);
      expect(mockView.setZoom).toHaveBeenCalledWith(7);
    });
    it('deberia mostrar advertencia si no hay mapa', () => {
      spyOn(console, 'warn');
      mockMapService.getMap.and.returnValue(null);

      service.centerMapOnPoint([0, 0]);

      expect(console.warn).toHaveBeenCalledWith(
        'El mapa no está disponible aún.'
      );
    });
  });

  describe('removeLayerByName', () => {
    it('deberia eliminar la capa con el nombre especificado', () => {
      const mockLayer = new VectorLayer({
        properties: { name: 'layer-to-remove' },
      });
      const mockLayerArray: BaseLayer[] = [mockLayer];
      // Creamos un mock tipado para getLayers()
      const mockLayerGroup: {
        getLayers: () => { getArray: () => BaseLayer[] };
      } = {
        getLayers: () => ({
          getArray: () => mockLayerArray,
        }),
      };
      const mockMap: Partial<OlMap> = {
        render: jasmine.createSpy('render'),
      };
      mockMapService.getLayerGroupByName.and.returnValue(
        mockLayerGroup as LayerGroup
      );
      mockMapService.getMap.and.returnValue(mockMap as OlMap);

      service.removeLayerByName('layer-to-remove');
      expect(mockMap.render).toHaveBeenCalled();
      expect(mockLayerArray.length).toBe(0);
    });

    it('no deberia hacer nada si no se encuentra el grupo de capas', () => {
      mockMapService.getLayerGroupByName.and.returnValue(null);
      service.removeLayerByName('any-layer');

      expect(mockMapService.getLayerGroupByName).toHaveBeenCalledWith(
        LayerLevel.UPPER
      );
    });
  });

  describe('transformarCoordenada', () => {
    it('deberia transformar la coordenada correctamente', () => {
      const coord: [number, number] = [-74.1, 4.6];
      const transformed = service.transformarCoordenada(
        'EPSG:4326',
        'EPSG:9377',
        coord
      );

      expect(Array.isArray(transformed)).toBeTrue();
      expect(transformed.length).toBe(2);
    });
  });
});
