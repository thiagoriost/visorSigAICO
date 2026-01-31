import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { UrlWFSService } from './url-wfs.service';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { MapState } from '@app/core/interfaces/store/map.model';

describe('UrlWFSService', () => {
  let service: UrlWFSService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let storeSpy: jasmine.SpyObj<Store<MapState>>;

  beforeEach(() => {
    // Crear los spies
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    storeSpy = jasmine.createSpyObj('Store', ['select']);

    TestBed.configureTestingModule({
      providers: [
        UrlWFSService,
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: Store, useValue: storeSpy },
      ],
    });

    service = TestBed.inject(UrlWFSService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should handle error when response is undefined in getCapabilitiesWFS', async () => {
    // Arrange
    const url = 'http://example.com/wfs';
    storeSpy.select.and.returnValue(of('http://proxy.url/'));
    httpClientSpy.get.and.returnValue(of(undefined));

    // Act & Assert
    await expectAsync(service.getCapabilitiesWFS(url)).toBeRejectedWithError(
      'La respuesta es undefined'
    );
  });

  it('should handle error when response is undefined in getFeatureFromLayer', async () => {
    // Arrange
    const url = 'http://example.com/wfs';
    const layerName = 'layer1';
    storeSpy.select.and.returnValue(of('http://proxy.url/'));
    httpClientSpy.get.and.returnValue(of(undefined));

    // Act & Assert
    await expectAsync(
      service.getFeatureFromLayer(url, layerName)
    ).toBeRejectedWithError('La respuesta del WFS es undefined');
  });

  it('should handle error when response is undefined in getLayerAttributes', async () => {
    // Arrange
    const url = 'http://example.com/wfs';
    const layerName = 'layer1';
    storeSpy.select.and.returnValue(of('http://proxy.url/'));
    httpClientSpy.get.and.returnValue(of(undefined));

    // Act & Assert
    await expectAsync(
      service.getLayerAttributes(url, layerName)
    ).toBeRejectedWithError('La respuesta es undefined');
  });

  it('should handle error when response is undefined in getValuesForAttribute', async () => {
    // Arrange
    const url = 'http://example.com/wfs';
    const layerName = 'layer1';
    const attributeName = 'attribute1';
    storeSpy.select.and.returnValue(of('http://proxy.url/'));
    httpClientSpy.get.and.returnValue(of(undefined));

    // Act & Assert
    await expectAsync(
      service.getValuesForAttribute(url, layerName, attributeName)
    ).toBeRejectedWithError('La respuesta es undefined');
  });
});
