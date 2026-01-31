import { TestBed } from '@angular/core/testing';
import { GeoJsonLayerService } from './geo-json-layer.service';
import VectorLayer from 'ol/layer/Vector';

describe('GeoJsonLayerService', () => {
  let service: GeoJsonLayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeoJsonLayerService);
  });

  it('debería instanciarse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debería generar un color rgba válido con opacidad por defecto', () => {
    const color = service.getRandomColor();
    expect(color).toMatch(/^rgba\(\d{1,3}, \d{1,3}, \d{1,3}, 1(\.0)?\)$/);
  });

  it('debería generar un color rgba válido con opacidad personalizada', () => {
    const color = service.getRandomColor(0.5);
    expect(color).toMatch(/^rgba\(\d{1,3}, \d{1,3}, \d{1,3}, 0\.5\)$/);
  });

  it('debería crear una capa vectorial válida desde GeoJSON de tipo Point', () => {
    const geojsonPoint = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [102.0, 0.5],
          },
          properties: {
            name: 'Sample Point',
          },
        },
      ],
    };

    const layer = service.crearLayerDesdeGeoJSON(geojsonPoint);
    expect(layer instanceof VectorLayer).toBeTrue();
    expect(layer.getSource()?.getFeatures().length).toBe(1);
  });

  it('debería aplicar un estilo único basado en el tipo de geometría (Polygon)', () => {
    const geojsonPolygon = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
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
          },
        },
      ],
    };

    const layer = service.crearLayerDesdeGeoJSON(geojsonPolygon);
    const styleFunction = layer.getStyle();
    expect(styleFunction).toBeDefined();
  });

  it('debería asignar propiedades si se pasan al crear la capa', () => {
    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [1, 2],
          },
        },
      ],
    };

    const properties = { custom: 'valor' };
    const layer = service.crearLayerDesdeGeoJSON(geojson, properties);

    expect(layer.get('custom')).toBe('valor');
  });
});
