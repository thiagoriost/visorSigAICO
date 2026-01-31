import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import ImageLayer from 'ol/layer/Image';
import { ImageWMS } from 'ol/source';
import { IdentifyQueryService } from '@app/widget/identify/services/identify-query-service/identify-query.service';
import { WMSCapabilities } from '@app/widget/add-wms/interfaces/wms-capabilities';
import { IdentifyWmsService } from '@app/widget/identify/services/identify-wms/identify-wms.service';
import { UrlWMSService } from '@app/shared/services/urlWMS/url-wms.service';
import { MapState } from '@app/core/interfaces/store/map.model';

describe('IdentifyWmsService', () => {
  let service: IdentifyWmsService;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let mockStore: jasmine.SpyObj<Store<MapState>>;
  let mockURLWMSService: jasmine.SpyObj<UrlWMSService>;
  let mockIdentifyQueryService: jasmine.SpyObj<IdentifyQueryService>;

  const initialState = {
    map: {
      center: [100, 100], // Latitud y longitud
      minZoom: 10, // Zoom minimo
      maxZoom: 20, // Zoom maximo
      projection: '', // Sistema de cordenadas de proyeccion Ejemplo: 'EPSG:4326'
      zoom: 6, // Zoom inicial},
    },
    proxyURL: 'https://example.com/proxy',
  } as MapState;

  beforeEach(() => {
    mockStore = jasmine.createSpyObj<Store<MapState>>('Store<MapState>', [
      'select',
      'dispatch',
    ]);
    mockStore.select.and.returnValue(of('http://proxy-url'));

    mockURLWMSService = jasmine.createSpyObj('UrlWMSService', [
      'getCapabilities',
      'XMLToJSON',
    ]);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);
    mockIdentifyQueryService = jasmine.createSpyObj('IdentifyQueryService', [
      'searchWFSFeature',
      'searchWMSFeatureInfo',
    ]);
    TestBed.configureTestingModule({
      providers: [
        IdentifyWmsService,
        provideMockStore({ initialState }),
        provideHttpClient(),
        { provide: Store<MapState>, useValue: mockStore },
        { provide: MessageService, useValue: mockMessageService },
        { provide: UrlWMSService, useValue: mockURLWMSService },
        { provide: IdentifyQueryService, useValue: mockIdentifyQueryService },
      ],
    });
    service = TestBed.inject(IdentifyWmsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Deberia consultar la informacion de un WMS', () => {
    const layer = new ImageLayer({
      source: new ImageWMS({
        url: 'http://example.com/wms',
      }),
    });
    const coordinate = [100, 100];
    const resolution = 256;
    const projection = 'EPSG:4326';
    const params = {
      INFO_FORMAT: 'application/vnd.ogc.gml',
    };
    const wmsResponse = '<WMS_Capabilities>...</WMS_Capabilities>';
    const wmsJSON: WMSCapabilities = {
      Service: {},
      Capability: {},
    };
    mockIdentifyQueryService.searchWMSFeatureInfo.and.returnValue(
      Promise.resolve(wmsResponse)
    );
    mockURLWMSService.XMLToJSON.and.returnValue(Promise.resolve(wmsJSON));
    service.getWMSInfo(layer, coordinate, resolution, projection, params);
    expect(mockIdentifyQueryService.searchWMSFeatureInfo).toHaveBeenCalled();
  });

  it('Deberia manejar error al consultar la informacion de un WMS', () => {
    const layer = new ImageLayer({
      source: new ImageWMS({
        url: 'http://example.com/wms',
      }),
    });
    const coordinate = [100, 100];
    const resolution = 256;
    const projection = 'EPSG:4326';
    const params = {
      INFO_FORMAT: 'application/vnd.ogc.gml',
    };
    mockIdentifyQueryService.searchWMSFeatureInfo.and.returnValue(
      Promise.reject('Error en la consulta WMS')
    );
    service.getWMSInfo(layer, coordinate, resolution, projection, params);
    expect(mockIdentifyQueryService.searchWMSFeatureInfo).toHaveBeenCalled();
  });

  it('Deberia manejar caso cuando no se obtiene URL de FeatureInfo', () => {
    const layer = new ImageLayer({
      source: new ImageWMS({
        url: 'http://example.com/wms',
      }),
    });
    const coordinate = [100, 100];
    const resolution = 256;
    const projection = 'EPSG:4326';
    const params = {
      INFO_FORMAT: 'application/vnd.ogc.gml',
    };
    spyOn(layer.getSource()!, 'getFeatureInfoUrl').and.returnValue(undefined);
    service.getWMSInfo(layer, coordinate, resolution, projection, params);
    expect(layer.getSource()!.getFeatureInfoUrl).toHaveBeenCalledWith(
      coordinate,
      resolution,
      projection,
      params
    );
  });

  it('Deberia usar proxy al consultar la informacion de un WMS', () => {
    service.proxyURL = 'http://proxy-url/';
    const layer = new ImageLayer({
      source: new ImageWMS({
        url: 'http://example.com/wms',
      }),
    });
    const coordinate = [100, 100];
    const resolution = 256;
    const projection = 'EPSG:4326';
    const params = {
      INFO_FORMAT: 'application/vnd.ogc.gml',
    };
    const wmsResponse = '<WMS_Capabilities>...</WMS_Capabilities>';
    mockIdentifyQueryService.searchWMSFeatureInfo.and.returnValue(
      Promise.resolve(wmsResponse)
    );
    service.getWMSInfo(layer, coordinate, resolution, projection, params);
    expect(mockIdentifyQueryService.searchWMSFeatureInfo).toHaveBeenCalledWith(
      'http://proxy-url/http://example.com/wms?INFO_FORMAT=application%2Fvnd.ogc.gml&REQUEST=GetFeatureInfo&SERVICE=WMS&VERSION=1.3.0&FORMAT=image%2Fpng&STYLES=&TRANSPARENT=true&I=50&J=50&WIDTH=101&HEIGHT=101&CRS=EPSG%3A4326&BBOX=-12828%2C-12828%2C13028%2C13028'
    );
  });
});
