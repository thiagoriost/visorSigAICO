import { TestBed } from '@angular/core/testing';
import {
  BufferAreaCoordenadaService,
  CoordenadaGeografica,
} from './buffer-area-coordenada.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MapService } from '@app/core/services/map-service/map.service';
import { Store } from '@ngrx/store';
import { BufferAreaService } from '@app/widget/bufferArea/services/buffer-area.service';
import { Map as OlMap, View } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { of } from 'rxjs';
import { FeatureCollection } from 'geojson';

describe('Servicio BufferAreaCoordenadaService', () => {
  let servicio: BufferAreaCoordenadaService;
  let mapaFalso: OlMap;
  let bufferServiceMock: jasmine.SpyObj<BufferAreaService>;

  const coordenadaPrueba: CoordenadaGeografica = {
    id: '1',
    latitud: 4.65,
    longitud: -74.05,
    tipoGrado: 'decimal',
  };

  const geojsonSimulado: FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
        },
        properties: {},
      },
    ],
  };

  beforeEach(() => {
    const mapServiceMock = {
      getMap: (): OlMap => mapaFalso,
      getLayerGroupByName: (): {
        getLayers: () => {
          getArray: () => unknown[];
          push: () => void;
        };
      } => ({
        getLayers: () => ({
          getArray: () => [],
          push: () => {
            // Método simulado
          },
        }),
      }),
    };

    bufferServiceMock = jasmine.createSpyObj<BufferAreaService>(
      'BufferAreaService',
      ['generarBufferDesdeGeojson']
    );
    bufferServiceMock.generarBufferDesdeGeojson.and.returnValue(
      Promise.resolve(geojsonSimulado)
    );

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        BufferAreaCoordenadaService,
        { provide: MapService, useValue: mapServiceMock },
        { provide: Store, useValue: { select: () => of() } },
        { provide: BufferAreaService, useValue: bufferServiceMock },
      ],
    });

    servicio = TestBed.inject(BufferAreaCoordenadaService);

    mapaFalso = new OlMap({
      target: document.createElement('div'),
      layers: [],
      view: new View({ center: [0, 0], zoom: 2 }),
    });
  });

  it('debería crear el servicio correctamente', () => {
    expect(servicio).toBeTruthy();
  });

  it('debería convertir coordenada a GeoJSON tipo Point', () => {
    const geojson = (
      servicio as unknown as {
        generarGeometriaDesdeCoordenada: (coord: CoordenadaGeografica) => {
          type: string;
          coordinates: [number, number];
        };
      }
    ).generarGeometriaDesdeCoordenada(coordenadaPrueba);

    expect(geojson).toEqual({
      type: 'Point',
      coordinates: [4.65, -74.05],
    });
  });

  it('debería rechazar coordenada con tipo no soportado', () => {
    const coordenadaInvalida: CoordenadaGeografica = {
      ...coordenadaPrueba,
      tipoGrado: 'otro' as 'decimal',
    };

    expect(() =>
      (
        servicio as unknown as {
          generarGeometriaDesdeCoordenada: (
            coord: CoordenadaGeografica
          ) => unknown;
        }
      ).generarGeometriaDesdeCoordenada(coordenadaInvalida)
    ).toThrowError('Tipo de coordenada no soportado: otro');
  });

  it('debería realizar petición al bufferService y devolver FeatureCollection', async () => {
    const resultado = await servicio.realizarPeticionBufferDesdeCoordenada(
      coordenadaPrueba,
      100
    );
    expect(bufferServiceMock.generarBufferDesdeGeojson).toHaveBeenCalled();
    expect(resultado).toEqual(geojsonSimulado);
  });

  it('debería lanzar error si el mapa no está inicializado', async () => {
    spyOn(servicio['mapService'], 'getMap').and.returnValue(
      null as unknown as OlMap
    );

    await expectAsync(
      servicio.dibujarBufferDesdeCoordenada(coordenadaPrueba, 100, 'm')
    ).toBeRejectedWith('El mapa no está inicializado');
  });

  it('debería limpiar la capa de buffer correctamente', () => {
    const fuente = servicio.vectorSource as VectorSource;
    const capa = servicio.vectorLayer as VectorLayer;

    spyOn(fuente, 'clear').and.callThrough();
    spyOn(capa, 'setVisible').and.callThrough();

    servicio.limpiarBuffer();

    expect(fuente.clear).toHaveBeenCalled();
    expect(capa.setVisible).toHaveBeenCalledWith(false);
  });

  describe('Conversión de unidades', () => {
    it('debería convertir kilómetros a metros', () => {
      expect(servicio.convertirDistancia(2, 'km')).toBe(2000);
    });

    it('debería mantener metros sin cambio', () => {
      expect(servicio.convertirDistancia(500, 'm')).toBe(500);
    });

    it('debería convertir millas a metros', () => {
      expect(servicio.convertirDistancia(1, 'mi')).toBeCloseTo(1609.34, 2);
    });

    it('debería convertir millas náuticas a metros', () => {
      expect(servicio.convertirDistancia(1, 'nmi')).toBe(1852);
    });

    it('debería retornar la misma distancia si la unidad no es reconocida', () => {
      expect(servicio.convertirDistancia(100, 'foo')).toBe(100);
    });
  });
});
