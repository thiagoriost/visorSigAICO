import { TestBed } from '@angular/core/testing';

import { IdentifyWfsService } from './identify-wfs.service';
import { MapService } from '@app/core/services/map-service/map.service';
import LayerGroup from 'ol/layer/Group';
import { ResultIdentifyWMSQuery } from '../../interfaces/ResultIdentifyQuery';
import { MessageService } from 'primeng/api';
import { provideMockStore } from '@ngrx/store/testing';
import { Store } from '@ngrx/store';
import { MapState } from '@app/core/interfaces/store/map.model';
import { FeatureResult } from '../../interfaces/FeatureResult';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { of } from 'rxjs';

describe('IdentifyWfsService', () => {
  let service: IdentifyWfsService;
  let mockMapService: jasmine.SpyObj<MapService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let mockStore: jasmine.SpyObj<Store<MapState>>;
  const initialState = {
    map: null,
    proxyURL: 'https://example.com/proxy',
  };

  beforeEach(() => {
    mockMapService = jasmine.createSpyObj<MapService>(
      'MapService',
      ['map', 'getLayerByDefinition', 'addLayer', 'getLayerGroupByName'],
      {
        map: null,
      }
    );
    mockStore = jasmine.createSpyObj<Store<MapState>>('Store<MapState>', [
      'select',
      'dispatch',
    ]);
    mockStore.select.and.returnValue(of('http://proxy-url'));
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);
    TestBed.configureTestingModule({
      providers: [
        IdentifyWfsService,
        provideMockStore({ initialState }),
        {
          provide: Store<MapState>,
          useValue: mockStore,
        },
        { provide: MessageService, useValue: mockMessageService },
      ],
    });
    service = TestBed.inject(IdentifyWfsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('debería crear y agregar la capa vectorial al mapa y al grupo de capas superior', () => {
    const mockLayerGroup: LayerGroup = new LayerGroup({
      properties: { level: 'upper' },
    });
    mockMapService.getLayerGroupByName.and.returnValue(mockLayerGroup);

    const featureData: ResultIdentifyWMSQuery = {
      type: 'FeatureCollection',
      totalFeatures: '1',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [0, 0],
          },
          properties: {},
          id: '1',
          geometry_name: 'geom',
        },
      ],
      crs: {
        type: 'name',
        properties: {
          name: 'EPSG:4326',
        },
      },
    };
    service.drawGeometry(featureData);
    expect(service.drawedVectorLayer).toBeTruthy(); // La capa fue guardada internamente
  });

  it('Deberia llamar al servicio de agregar mensaje al no encontrar el grupo de capas', () => {
    const geometry: ResultIdentifyWMSQuery = {
      type: 'FeatureCollection',
      totalFeatures: 'unknown',
      features: [
        {
          type: 'Feature',
          id: 'Areas_Clave_Biodiversidad_KBA.112',
          geometry: {
            type: 'MultiPolygon',
            coordinates: [
              [
                [
                  [-73.12424078, 2.21770498],
                  [-73.15817103, 2.16330713],
                  [-73.09759877, 2.08891441],
                  [-73.01551383, 2.07368479],
                  [-72.99539754, 2.02556679],
                  [-72.87488936, 1.99249878],
                  [-72.78054825, 1.91724964],
                  [-72.78349788, 1.79245146],
                ],
              ],
            ],
          },
          geometry_name: 'geom',
          properties: {
            sitrecid: 19049,
            region: 'South America',
            country: 'Colombia',
            iso3: 'COL',
            natname: 'Parque Nacional Natural Serranía de Chiribiquete',
            intname: 'Serrania de Chiribiquete Natural National Park',
            sitlat: 0.79350619,
            sitlong: -73.01890184,
            sitareakm2: 42661.687081,
            kbastatus: 'confirmed',
            kbaclass: 'Global',
            ibastatus: 'confirmed',
            azestatus: null,
            lastupdate: '2023',
            source: 'IBA Directory Process',
            deltxt:
              'New boundaries were stablished to follow exactly the limits of the entire Serrania El Chiribequete Natural National Park',
            shape_leng: 1749420.27934,
            factsheet:
              'https://www.keybiodiversityareas.org/site/factsheet/19049',
            fuentecapa:
              "<a href= https://www.keybiodiversityareas.org/ target='_blank'>Key Biodiversity Areas Partnership</a>",
            fecha_capa: '07/OCT/2024',
            info_capa:
              "<a href= https://workdrive.zohoexternal.com/sheet/open/updeo4933cb276de74edd9b324b630bbe7d34?sheetid=0&range=A43&authId=%7B%22linkId%22%3A%223XUVhVrRjv6-OQgeA%22%7D  target='_blank'>Abrir información</a>",
          },
        },
      ],
      crs: {
        type: 'name',
        properties: {
          name: 'urn:ogc:def:crs:EPSG::4326',
        },
      },
    };

    service.drawGeometry(geometry);
    expect(mockMessageService.add).toHaveBeenCalled();
  });

  it('debe retornar null si geometry es null', () => {
    const feature = { geometry: null } as unknown as FeatureResult;
    const result = service.getStyleOfFeature(feature);
    expect(result).toBeNull();
  });

  it('debe retornar estilo para Point', () => {
    const feature = {
      geometry: { type: 'Point', coordinates: [[1, 2]] },
    } as unknown as FeatureResult;
    const result = service.getStyleOfFeature(feature);
    expect(result).toBeInstanceOf(Style);
    const image = result!.getImage() as CircleStyle;
    expect(image).toBeDefined();
    const stroke = image.getStroke() as Stroke;
    expect(stroke.getColor()).toBe('#FF1493');
    expect(stroke.getWidth()).toBe(6);
  });

  it('debe retornar estilo para LineString', () => {
    const feature = {
      geometry: { type: 'LineString', coordinates: [[1, 2]] },
    } as unknown as FeatureResult;
    const result = service.getStyleOfFeature(feature);
    expect(result).toBeInstanceOf(Style);
    const stroke = result!.getStroke() as Stroke;
    expect(stroke.getColor()).toBe('#CCFF00');
    expect(stroke.getWidth()).toBe(3);
  });

  it('debe retornar estilo para Polygon', () => {
    const feature = {
      geometry: { type: 'Polygon', coordinates: [[[1, 2]]] },
    } as unknown as FeatureResult;

    const result = service.getStyleOfFeature(feature);

    expect(result).toBeInstanceOf(Style);
    const stroke = result!.getStroke() as Stroke;
    const fill = result!.getFill() as Fill;
    expect(stroke.getColor()).toBe('#00FFFF');
    expect(fill.getColor()).toBe('rgba(0, 0, 255, 0.1)');
  });

  it('debe retornar estilo para Circle', () => {
    const feature = {
      geometry: { type: 'Circle', coordinates: [[[1, 2]]] },
    } as unknown as FeatureResult;

    const result = service.getStyleOfFeature(feature);

    expect(result).toBeInstanceOf(Style);
    const stroke = result!.getStroke() as Stroke;
    const fill = result!.getFill() as Fill;
    expect(stroke.getColor()).toBe('#FF1493');
    expect(fill.getColor()).toBe('#FF6600');
  });

  it('debe retornar un arreglo vacío si la lista de features está vacía', () => {
    const result = service.getStylesOfFeatures([]);
    expect(result).toEqual([]);
  });

  it('debe llamar a getStyleOfFeature por cada feature y devolver los estilos válidos', () => {
    const features = [
      { geometry: { type: 'Point', coordinates: [[1, 2]] } },
      { geometry: { type: 'LineString', coordinates: [[3, 4]] } },
      { geometry: null },
    ] as unknown as FeatureResult[];
    const mockStyle1 = new Style();
    const mockStyle2 = new Style();
    const spy = spyOn(service, 'getStyleOfFeature').and.callFake(feature => {
      if (feature.geometry === null) return null;
      const geometry = feature.geometry as {
        type: string;
        coordinates: [[number, number]];
      };
      return geometry.type === 'Point' ? mockStyle1 : mockStyle2;
    });
    const result = service.getStylesOfFeatures(features);
    expect(spy).toHaveBeenCalledTimes(3);
    expect(result.length).toBe(2);
    expect(result).toEqual([mockStyle1, mockStyle2]);
  });

  it('debe retornar solo los estilos no nulos', () => {
    const features = [
      { geometry: { type: 'Point', coordinates: [[1, 2]] } },
      { geometry: null },
    ] as unknown as FeatureResult[];
    const mockStyle = new Style();
    spyOn(service, 'getStyleOfFeature').and.returnValues(mockStyle, null);
    const result = service.getStylesOfFeatures(features);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(mockStyle);
  });
});
