import { TestBed } from '@angular/core/testing';
import { BufferAreaService } from './buffer-area.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { MapService } from '@app/core/services/map-service/map.service';
import { Polygon } from 'ol/geom';
import { AttributeTableData } from '@app/widget/attributeTable/interfaces/geojsonInterface';

describe('método generarBufferDesdeGeometria', () => {
  let service: BufferAreaService;

  beforeEach(() => {
    const mockMapService = jasmine.createSpyObj<MapService>('MapService', [
      'getMap',
      'getLayerGroupByName',
    ]);

    const mockStore: Partial<Store> = {
      select: () => of({ urlService: 'http://mock-wfs.com/' }),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        BufferAreaService,
        { provide: MapService, useValue: mockMapService },
        { provide: Store, useValue: mockStore },
      ],
    });

    service = TestBed.inject(BufferAreaService);
  });

  it('debe limpiar la fuente y generar buffer desde geometría', async () => {
    const geometria = new Polygon([
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ],
    ]);

    const nombreCapa = 'nombre_capa_prueba';
    const urlWfs = 'http://mock-wfs.com/';
    const distanciaMetros = 100;

    const resultadoMock: AttributeTableData[] = [
      {
        titulo: 'resultado simulado',
        geojson: {
          type: 'FeatureCollection',
          features: [],
        },
        visible: true,
      },
    ];

    spyOn(
      service as unknown as {
        consultarSeleccionEspacialYGenerarBuffer: (
          geometry: Polygon,
          nombreCapa: string,
          urlWfs: string,
          distanciaMetros: number
        ) => Promise<AttributeTableData[]>;
      },
      'consultarSeleccionEspacialYGenerarBuffer'
    ).and.returnValue(Promise.resolve(resultadoMock));

    const resultado = await service.generarBufferDesdeGeometria(
      geometria,
      nombreCapa,
      urlWfs,
      distanciaMetros
    );

    expect(resultado).toEqual(resultadoMock);
  });
});
