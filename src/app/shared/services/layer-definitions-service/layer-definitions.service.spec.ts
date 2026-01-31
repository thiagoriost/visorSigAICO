import { TestBed } from '@angular/core/testing';
import { LayerDefinitionsService } from './layer-definitions.service';
import axios, { AxiosError, AxiosRequestHeaders, AxiosResponse } from 'axios';

describe('LayerDefinitionsService', () => {
  let service: LayerDefinitionsService;
  // Crear un espía para axios
  let axiosSpy: jasmine.SpyObj<typeof axios>;

  beforeEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; // 10 segundos
    // Crear un espía para la instancia de axios
    axiosSpy = jasmine.createSpyObj('axios', ['get']);

    TestBed.configureTestingModule({
      providers: [
        LayerDefinitionsService,
        { provide: axios, useValue: axiosSpy },
      ],
    });
    service = TestBed.inject(LayerDefinitionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('getAllAvailableLayers', () => {
    it('should return a list of layers when the API call is successful', async () => {
      const mockResponse: AxiosResponse = {
        data: {
          Result: [
            { id: '1', titulo: 'Layer 1', leaf: true },
            { id: '2', titulo: 'Layer 2', leaf: true },
            { id: '3', titulo: 'Layer 3', leaf: true },
            { id: '4', titulo: 'Layer 4', leaf: true },
            { id: '5', titulo: 'Layer 5', leaf: true },
            { id: '6', titulo: 'Layer 6', leaf: true },
            { id: '7', titulo: 'Layer 7', leaf: true },
            { id: '8', titulo: 'Layer 8', leaf: true },
            { id: '9', titulo: 'Layer 9', leaf: true },
            { id: '10', titulo: 'Layer 10', leaf: true },
            { id: '11', titulo: 'Layer 11', leaf: true },
            { id: '12', titulo: 'Layer 12', leaf: true },
            { id: '13', titulo: 'Layer 13', leaf: true },
          ],
        }, // Respuesta mock de ejemplo
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as AxiosRequestHeaders },
      };

      // CORRECTO: espiar la instancia que se usa en el servicio
      spyOn(service['axiosInstance'], 'get').and.returnValue(
        Promise.resolve(mockResponse)
      );

      const result = await service.getAllAvailableLayers();
      expect(Array.isArray(result)).toBeTrue();
      expect(result.length).toEqual(13);
    });

    it('should reject with a network error when offline', async () => {
      const error = new AxiosError('Network Error', 'ERR_NETWORK');

      // Espía directamente la instancia personalizada
      spyOn(service['axiosInstance'], 'get').and.returnValue(
        Promise.reject(error)
      );

      await expectAsync(service.getAllAvailableLayers()).toBeRejectedWith(
        jasmine.objectContaining({
          message: jasmine.stringMatching(/Network Error/),
        })
      );
    });

    it('should reject with an error when the response status is 404', async () => {
      const error404 = new AxiosError(
        'Request failed with status code 404',
        'ERR_BAD_REQUEST',
        { headers: {} as AxiosRequestHeaders },
        {},
        {
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: { headers: {} as AxiosRequestHeaders },
          data: {},
        }
      );

      spyOn(service['axiosInstance'], 'get').and.returnValue(
        Promise.reject(error404)
      );

      await expectAsync(service.getAllAvailableLayers()).toBeRejectedWith(
        jasmine.objectContaining({
          message: jasmine.stringMatching(/404/),
        })
      );
    });
  });
});
