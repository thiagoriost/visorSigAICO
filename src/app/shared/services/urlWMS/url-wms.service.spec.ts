import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { UrlWMSService } from './url-wms.service';
import { Store } from '@ngrx/store';
import { MapState } from '@app/core/interfaces/store/map.model';

// ==== Datos simulados ====
const mockProxy = 'https://proxy.local/';
const mockUrl =
  'https://geoserver.cntindigena.org:9443/geoserver/INDIGENA/wms?';

const mockXML = `<?xml version="1.0" encoding="UTF-8"?>
  <WMS_Capabilities version="1.3.0">
    <Service>
      <Name>WMS</Name>
      <Title>GeoServer Web Map Service</Title>
      <Abstract>A compliant implementation of WMS plus most of the SLD extension (dynamic styling).</Abstract>
    </Service>
    <Capability>
      <Layer>
        <Name>indigena:geoserver_layer</Name>
        <Title>GeoServer Web Map Service</Title>
        <Abstract>A compliant implementation of WMS plus most of the SLD extension (dynamic styling).</Abstract>
        <CRS>AUTO:42001</CRS>
        <CRS>AUTO:42002</CRS>
        <CRS>EPSG:2000</CRS>
        <CRS>EPSG:2001</CRS>
        <CRS>EPSG:4326</CRS>
      </Layer>
    </Capability>
  </WMS_Capabilities>`;

const mockJSON = {
  '@version': '1.3.0',
  Service: {
    Name: 'WMS',
    Title: 'GeoServer Web Map Service',
    Abstract:
      'A compliant implementation of WMS plus most of the SLD extension (dynamic styling).',
  },
  Capability: {
    Layer: {
      Name: 'indigena:geoserver_layer',
      Title: 'GeoServer Web Map Service',
      Abstract:
        'A compliant implementation of WMS plus most of the SLD extension (dynamic styling).',
      CRS: ['AUTO:42001', 'AUTO:42002', 'EPSG:2000', 'EPSG:2001', 'EPSG:4326'],
    },
  },
};

const mockLayers = [
  {
    Name: 'indigena:geoserver_layer',
    Title: 'GeoServer Web Map Service',
    Abstract:
      'A compliant implementation of WMS plus most of the SLD extension (dynamic styling).',
    CRS: ['AUTO:42001', 'AUTO:42002', 'EPSG:2000', 'EPSG:2001', 'EPSG:4326'],
    displayName: 'GeoServer Web Map Service',
    qualifiedName: 'indigena:geoserver_layer',
  },
];

describe('UrlWMSService', () => {
  let service: UrlWMSService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let storeSpy: jasmine.SpyObj<Store<MapState>>;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    storeSpy = jasmine.createSpyObj('Store', ['select']);

    storeSpy.select.and.returnValue(of(mockProxy));

    TestBed.configureTestingModule({
      providers: [
        UrlWMSService,
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: Store, useValue: storeSpy },
      ],
    });

    service = TestBed.inject(UrlWMSService);
  });

  // ==== Pruebas ====

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should throw error if response is undefined in getCapabilities', async () => {
    // Arrange
    const url = mockUrl;
    httpClientSpy.get.and.returnValue(of(undefined));

    // Act & Assert
    await expectAsync(service.getCapabilities(url)).toBeRejectedWithError(
      'La respuesta es undefined'
    );
  });

  it('should return XML response from getCapabilities', async () => {
    // Arrange
    const url =
      'https://geoserver.cntindigena.org:9443/geoserver/INDIGENA/wms?';
    const mockXml = '<xml>test</xml>';
    const proxy = 'https://proxy.local/';

    storeSpy.select.and.returnValue(of(proxy));
    httpClientSpy.get.and.returnValue(of(mockXml));

    // Act
    const result = await service.getCapabilities(url);

    // Assert
    expect(result).toBe(mockXml);

    // Verificamos que HttpClient.get fue llamado con la URL correcta
    const calledUrl = httpClientSpy.get.calls.mostRecent().args[0];
    console.log('👉 Called URL:', calledUrl);

    expect(calledUrl).toContain(encodeURIComponent(url)); // la parte codificada debe estar después
  });

  it('should correctly convert XML to JSON', async () => {
    // Act
    const result = await service.XMLToJSON(mockXML);

    // Assert
    expect(result).toEqual(mockJSON);
  });

  it('should correctly map layers from XML', async () => {
    // Act
    const result = await service.mapLayers(mockXML);

    // Assert
    expect(result).toEqual(mockLayers);
  });

  it('should handle error in mapLayers gracefully', async () => {
    // Arrange
    spyOn(service, 'XMLToJSON').and.returnValue(Promise.reject('parse error'));

    // Act
    const result = await service.mapLayers('<invalid/>');

    // Assert
    expect(result).toEqual([]);
  });

  it('should correctly map layers from WMS URL', async () => {
    // Arrange
    const url = mockUrl;
    httpClientSpy.get.and.returnValue(of(mockXML));

    // Act
    const result = await service.getLayersFromWMS(url);

    // Assert
    expect(result).toEqual(mockLayers);
    expect(httpClientSpy.get).toHaveBeenCalled();
  });

  it('should handle error in getLayersFromWMS gracefully', async () => {
    // Arrange
    const url = mockUrl;
    httpClientSpy.get.and.returnValue(
      throwError(() => new Error('network error'))
    );

    // Act
    const result = await service.getLayersFromWMS(url);

    // Assert
    expect(result).toEqual([]);
  });
});
