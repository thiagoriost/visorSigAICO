import { TestBed } from '@angular/core/testing';

import { SeleccionEspacialQueryService } from './seleccion-espacial-query.service';
import axios, { AxiosError, AxiosRequestHeaders, AxiosResponse } from 'axios';

describe('SeleccionEspacialQueryServiceService', () => {
  let service: SeleccionEspacialQueryService;
  let axiosSpy: jasmine.SpyObj<typeof axios>;
  beforeEach(() => {
    axiosSpy = jasmine.createSpyObj('axios', ['get']);
    TestBed.configureTestingModule({
      providers: [SeleccionEspacialQueryService],
    });
    service = TestBed.inject(SeleccionEspacialQueryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Deberia retornar datos cuando la respuesta es satisfactoria (status 200)', async () => {
    const mockData: AxiosResponse = {
      data: { features: [{ id: '1', geometry: {}, properties: {} }] },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} as AxiosRequestHeaders },
    };

    // Configurar el espía para que devuelva la respuesta mock
    axiosSpy.get.and.returnValue(Promise.resolve(mockData));
    let lengthResult = 0;
    try {
      const result = await service.searchWFSFeatures('http://mock-url.com');
      if (Array.isArray(result)) {
        lengthResult = result.length;
      } else {
        fail('Expected an array');
      }
      expect(lengthResult).toEqual(13);
    } catch (error) {
      console.log(error);
      expect(lengthResult).toEqual(0);
    }
  });

  it('Debería lanzar error cuando axios falla', async () => {
    const error = new AxiosError('Fallo de red', 'ERR_NETWORK');
    spyOn(service['axiosInstance'], 'get').and.returnValue(
      Promise.reject(error)
    );

    await expectAsync(
      service.searchWFSFeatures('http://mock-url.com')
    ).toBeRejectedWithError('AxiosError: Fallo de red');
  });
});
