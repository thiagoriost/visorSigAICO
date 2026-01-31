import { TestBed } from '@angular/core/testing';
import { MapDrawService } from './map-draw.service';
import { MapService } from '@app/core/services/map-service/map.service';
import { Feature, Map, View } from 'ol';
import { Point, LineString, Polygon } from 'ol/geom';
import { Geometria } from '../../interfaces/geojsonInterface';
import VectorLayer from 'ol/layer/Vector';
import LayerGroup from 'ol/layer/Group';
import Collection from 'ol/Collection';

describe('MapDrawService', () => {
  let service: MapDrawService;
  let mapServiceMock: jasmine.SpyObj<MapService>;
  let mockMap: jasmine.SpyObj<Map>;
  let mockView: jasmine.SpyObj<View>;
  let mockLayerGroup: jasmine.SpyObj<LayerGroup>;

  beforeEach(() => {
    // Crear mocks para OpenLayers View y Map
    mockView = jasmine.createSpyObj('View', ['fit']);
    mockMap = jasmine.createSpyObj('Map', ['getView']);
    mockMap.getView.and.returnValue(mockView);

    // Mock de MapService con métodos simulados
    mapServiceMock = jasmine.createSpyObj('MapService', [
      'getMap',
      'getLayerGroupByName',
    ]);
    mapServiceMock.getMap.and.returnValue(mockMap);

    // Mock de LayerGroup con un array tipado de VectorLayer
    mockLayerGroup = jasmine.createSpyObj('LayerGroup', ['getLayers']);
    const layerArray: VectorLayer[] = [];
    const mockCollection = {
      push: (layer: VectorLayer) => layerArray.push(layer),
      getArray: () => layerArray,
    } as unknown as Collection<VectorLayer>;
    mockLayerGroup.getLayers.and.returnValue(mockCollection);

    // Configuración del TestBed con MapDrawService y MapService mockeado
    TestBed.configureTestingModule({
      providers: [
        MapDrawService,
        { provide: MapService, useValue: mapServiceMock },
      ],
    });

    service = TestBed.inject(MapDrawService);
  });

  // Verifica que el método haga zoom a las geometrías cuando existen features válidos
  it('debería hacer zoom a las geometrías cuando hay features válidos', () => {
    const feature = new Feature(new Point([10, 10]));
    const features = [feature];

    service.zoomToFeaturesExtent(features);

    expect(mockView.fit).toHaveBeenCalled();
  });

  // Verifica que no haga zoom si el mapa es null
  it('no debería hacer zoom si el mapa es null', () => {
    mapServiceMock.getMap.and.returnValue(null);
    const features = [new Feature(new Point([10, 10]))];

    service.zoomToFeaturesExtent(features);

    expect(mockView.fit).not.toHaveBeenCalled();
  });

  // Verifica que no haga zoom si el array de features está vacío
  it('no debería hacer zoom si el arreglo de features está vacío', () => {
    const features: Feature[] = [];

    service.zoomToFeaturesExtent(features);

    expect(mockView.fit).not.toHaveBeenCalled();
  });

  // Test para crear una Feature a partir de una geometría tipo Point
  it('debería crear una Feature desde una geometría tipo Point', () => {
    const geometry: Geometria = { type: 'Point', coordinates: [100, 200] };

    const feature = service.createFeatureFromGeometry(geometry, 'geometry');

    expect(feature).toBeTruthy();
    expect(feature?.getGeometry()).toBeInstanceOf(Point);
  });

  // Test para crear una Feature desde una geometría tipo LineString
  it('debería crear una Feature desde una geometría tipo LineString', () => {
    const geometry: Geometria = {
      type: 'LineString',
      coordinates: [
        [0, 0],
        [10, 10],
      ],
    };

    const feature = service.createFeatureFromGeometry(geometry, 'geometry');

    expect(feature).toBeTruthy();
    expect(feature?.getGeometry()).toBeInstanceOf(LineString);
  });

  // Test para crear una Feature desde una geometría tipo Polygon
  it('debería crear una Feature desde una geometría tipo Polygon', () => {
    const geometry: Geometria = {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
          [0, 0],
        ],
      ],
    };

    const feature = service.createFeatureFromGeometry(geometry, 'geometry');

    expect(feature).toBeTruthy();
    expect(feature?.getGeometry()).toBeInstanceOf(Polygon);
  });

  // Test que verifica que se agrega un grupo de features al mapa bajo una capa específica
  it('debería agregar un grupo de geometrías al mapa en una capa específica', () => {
    mapServiceMock.getLayerGroupByName.and.returnValue(mockLayerGroup);
    const features = [
      new Feature(new Point([1, 2])),
      new Feature(new Point([3, 4])),
    ];

    service.addGeometryGroupToMap(features, 'testLayer');

    const layers = mockLayerGroup.getLayers().getArray();
    expect(layers.length).toBe(1);
    expect(layers[0].get('id')).toBe('testLayer');
  });

  // Test que verifica que se agrega una capa al mapa a partir de una sola geometría
  it('debería crear y agregar una capa al mapa a partir de una sola geometría', () => {
    mapServiceMock.getLayerGroupByName.and.returnValue(mockLayerGroup);
    const geometry: Geometria = {
      type: 'Point',
      coordinates: [50, 50],
    };

    service.addSingleGeometryToMap(geometry, 'singleLayer');

    const layers = mockLayerGroup.getLayers().getArray();
    expect(layers.length).toBe(1);
    expect(layers[0].get('id')).toBe('singleLayer');
  });
});
