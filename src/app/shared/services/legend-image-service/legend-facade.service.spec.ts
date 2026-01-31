// legend-facade.service.small.spec.ts
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { LegendFacadeService } from './legend-facade.service';
import { MapLegendService } from '@app/core/services/map-legend-service/map-legend.service';
import { LegendImageService } from './legend-image.service';

// Stubs mínimos para tipar la respuesta del MapLegendService
interface LegendLayerStub {
  layerDefinition?: { titulo?: string };
  leyendaUrl?: string | null;
}
interface ObtenerCapasRespuestaStub {
  capas: LegendLayerStub[];
  mensajeError: string | null;
}

describe('LegendFacadeService (simple)', () => {
  let svc: LegendFacadeService;
  let mapLegend: jasmine.SpyObj<MapLegendService>;
  let legendImage: jasmine.SpyObj<LegendImageService>;

  beforeEach(() => {
    mapLegend = jasmine.createSpyObj<MapLegendService>('MapLegendService', [
      'obtenerCapasConLeyendas',
    ]);
    legendImage = jasmine.createSpyObj<LegendImageService>(
      'LegendImageService',
      ['loadLegendAsDataURL']
    );

    TestBed.configureTestingModule({
      providers: [
        LegendFacadeService,
        { provide: MapLegendService, useValue: mapLegend },
        { provide: LegendImageService, useValue: legendImage },
      ],
    });

    svc = TestBed.inject(LegendFacadeService);
  });

  it('devuelve una leyenda cuando hay leyendaUrl', async () => {
    const resp: ObtenerCapasRespuestaStub = {
      capas: [{ layerDefinition: { titulo: 'Capa A' }, leyendaUrl: 'urlA' }],
      mensajeError: null,
    };

    mapLegend.obtenerCapasConLeyendas.and.returnValue(
      of(resp) as unknown as ReturnType<
        MapLegendService['obtenerCapasConLeyendas']
      >
    );

    legendImage.loadLegendAsDataURL.and.returnValue(
      Promise.resolve('data:image/png;base64,A')
    );

    const out = await svc.getLegendsFromVisibleLayers();

    expect(mapLegend.obtenerCapasConLeyendas).toHaveBeenCalled();
    expect(legendImage.loadLegendAsDataURL).toHaveBeenCalledWith('urlA');
    expect(out).toEqual([
      { layerName: 'Capa A', dataUrl: 'data:image/png;base64,A' },
    ]);
  });

  it('omite una capa si falla la descarga de la leyenda', async () => {
    const resp: ObtenerCapasRespuestaStub = {
      capas: [{ layerDefinition: { titulo: 'Capa X' }, leyendaUrl: 'urlX' }],
      mensajeError: null,
    };

    mapLegend.obtenerCapasConLeyendas.and.returnValue(
      of(resp) as unknown as ReturnType<
        MapLegendService['obtenerCapasConLeyendas']
      >
    );

    legendImage.loadLegendAsDataURL.and.returnValue(Promise.reject('boom'));

    const out = await svc.getLegendsFromVisibleLayers();

    expect(legendImage.loadLegendAsDataURL).toHaveBeenCalledWith('urlX');
    expect(out).toEqual([]); // se omite la capa fallida
  });
});
