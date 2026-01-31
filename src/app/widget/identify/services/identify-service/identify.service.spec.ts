import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { IdentifyService } from '@app/widget/identify/services/identify-service/identify.service';
import { MapService } from '@app/core/services/map-service/map.service';
import { MapState } from '@app/core/interfaces/store/map.model';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { MessageService } from 'primeng/api';
import { UrlWMSService } from '@app/shared/services/urlWMS/url-wms.service';
import { IdentifyWmsService } from '../identify-wms/identify-wms.service';
import { IdentifyWfsService } from '../identify-wfs/identify-wfs.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('IdentifyService', () => {
  let service: IdentifyService;
  let mockMapService: jasmine.SpyObj<MapService>;
  let mockStore: jasmine.SpyObj<Store<MapState>>;

  const initialState = {
    map: null,
    proxyURL: 'https://example.com/proxy',
  };

  beforeEach(() => {
    mockStore = jasmine.createSpyObj<Store<MapState>>('Store<MapState>', [
      'select',
      'dispatch',
    ]);
    mockMapService = jasmine.createSpyObj<MapService>(
      'MapService',
      ['map', 'getLayerByDefinition', 'addLayer', 'getLayerGroupByName'],
      {
        map: null,
      }
    );
    mockStore.select.and.returnValue(of('http://proxy-url'));

    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({})],
      providers: [
        IdentifyService,
        provideMockStore({ initialState }),
        {
          provide: Store<MapState>,
          useValue: mockStore,
        },
        MessageService,
        UrlWMSService,
        IdentifyWmsService,
        IdentifyWfsService,
        MapService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(IdentifyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Deberia incrementar el contador de intentos al no encontrar mapa cargado', () => {
    mockMapService.map = null;
    service.onClickMap();
    expect(service.tryCounter).toEqual(2);
  });

  it('Deberia cambiar el valor de la capa seleccionada', () => {
    const layer: CapaMapa = { id: '1', leaf: true, titulo: 'Layer 1' };
    service.setLayerSelected(layer);
    expect(service.selectedLayer).toEqual(layer);
  });
});
