import { TestBed } from '@angular/core/testing';
import { MapLegendService } from './map-legend.service';
import { MapService } from '@app/core/services/map-service/map.service';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { MapState } from '@app/core/interfaces/store/map.model';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { ImageWMS } from 'ol/source';
import ImageLayer from 'ol/layer/Image';
import * as mapsSelectors from '@app/core/store/map/map.selectors';
import { throwError } from 'rxjs';

describe('Servicio MapLegendService', () => {
  let service: MapLegendService;
  let store: MockStore<MapState>;
  let mapServiceMock: jasmine.SpyObj<MapService>;

  const leyendaUrlSimulada = 'http://leyenda/capa1.png';

  const capasSimuladas: (LayerStore & { leyendaUrl?: string })[] = [
    {
      layerDefinition: { id: '1', titulo: 'Capa Uno', leaf: true },
      layerLevel: LayerLevel.INTERMEDIATE,
      orderInMap: 1,
      isVisible: true,
      transparencyLevel: 0,
      leyendaUrl: leyendaUrlSimulada,
    },
  ];

  beforeEach(() => {
    mapServiceMock = jasmine.createSpyObj<MapService>('MapService', [
      'getLayerByDefinition',
    ]);

    TestBed.configureTestingModule({
      providers: [
        MapLegendService,
        provideMockStore(),
        { provide: MapService, useValue: mapServiceMock },
      ],
    });

    service = TestBed.inject(MapLegendService);
    store = TestBed.inject(MockStore);
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debería retornar la URL de la leyenda cuando la capa y la fuente son válidas', done => {
    const capaStore = capasSimuladas[0];

    const capaOL = new ImageLayer({
      source: new ImageWMS({
        url: 'http://servidor/wms',
        params: { LAYERS: 'capa1' },
      }),
    });

    spyOn(capaOL.getSource()!, 'getLegendUrl').and.returnValue(
      leyendaUrlSimulada
    );
    mapServiceMock.getLayerByDefinition.and.returnValue(capaOL);

    store.overrideSelector(mapsSelectors.selectWorkAreaLayerList, [capaStore]);

    service.obtenerCapasConLeyendas().subscribe(resultado => {
      expect(resultado.capas.length).toBe(1);
      expect(resultado.capas[0].leyendaUrl).toBe(leyendaUrlSimulada);
      expect(resultado.mensajeError).toBeNull();
      done();
    });
  });

  it('debería manejar el caso donde la capa no está en el mapa', done => {
    const capaStore = capasSimuladas[0];

    mapServiceMock.getLayerByDefinition.and.returnValue(null);

    store.overrideSelector(mapsSelectors.selectWorkAreaLayerList, [capaStore]);

    service.obtenerCapasConLeyendas().subscribe(resultado => {
      expect(resultado.capas[0].leyendaUrl).toBeUndefined();
      expect(resultado.mensajeError).toContain('No se encontró la capa');
      done();
    });
  });

  it('debería manejar el caso donde no se puede obtener la URL de la leyenda', done => {
    const capaStore = capasSimuladas[0];

    const capaOL = new ImageLayer({
      source: new ImageWMS({
        url: 'http://servidor/wms',
        params: { LAYERS: 'capa1' },
      }),
    });

    spyOn(capaOL.getSource()!, 'getLegendUrl').and.returnValue(undefined);
    mapServiceMock.getLayerByDefinition.and.returnValue(capaOL);

    store.overrideSelector(mapsSelectors.selectWorkAreaLayerList, [capaStore]);

    service.obtenerCapasConLeyendas().subscribe(resultado => {
      expect(resultado.capas[0].leyendaUrl).toBeUndefined();
      expect(resultado.mensajeError).toContain(
        'Ocurrió un error al obtener la leyenda'
      );
      done();
    });
  });

  it('debería devolver mensaje de error general si ocurre un fallo inesperado', done => {
    spyOn(store, 'select').and.returnValue(
      throwError(() => new Error('Fallo inesperado'))
    );

    service.obtenerCapasConLeyendas().subscribe(resultado => {
      expect(resultado.capas.length).toBe(0);
      expect(resultado.mensajeError).toContain(
        'Error inesperado al obtener las leyendas'
      );
      done();
    });
  });

  it('debería lanzar error si la capa es nula al obtener leyenda', () => {
    expect(() =>
      service.obtenerLeyendaDesdeCapa(null as unknown as ImageLayer<ImageWMS>)
    ).toThrowError('La capa proporcionada es nula o indefinida.');
  });

  it('debería lanzar error si la fuente de la capa es inválida', () => {
    const capaSinFuente = new ImageLayer({
      source: null as unknown as ImageWMS,
    });

    expect(() => service.obtenerLeyendaDesdeCapa(capaSinFuente)).toThrowError(
      'La capa no tiene una fuente WMS válida.'
    );
  });

  it('debería lanzar error si no se puede obtener la URL de la leyenda', () => {
    const capa = new ImageLayer({
      source: new ImageWMS({
        url: 'http://servidor/wms',
        params: {},
      }),
    });

    spyOn(capa.getSource()!, 'getLegendUrl').and.returnValue(undefined);

    expect(() => service.obtenerLeyendaDesdeCapa(capa)).toThrowError(
      'No se pudo obtener la URL de la leyenda desde la fuente WMS.'
    );
  });
});
