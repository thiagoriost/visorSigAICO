import { TestBed } from '@angular/core/testing';
import { BuscarDireccionService } from './buscar-direccion.service';
import { MapService } from '@app/core/services/map-service/map.service';
import * as ol from 'ol'; // Importación de OpenLayers

describe('BuscarDireccionService', () => {
  let service: BuscarDireccionService;
  let mapServiceMock: jasmine.SpyObj<MapService>;

  // Creamos un mock más básico que cubra solo lo necesario
  const mapMock: Partial<ol.Map> = {
    getView: jasmine.createSpyObj('view', ['animate']),
    on: jasmine.createSpy('on'),
    once: jasmine.createSpy('once'),
    un: jasmine.createSpy('un'),
  };

  beforeEach(() => {
    // Crear un mock del MapService
    mapServiceMock = jasmine.createSpyObj('MapService', ['getMap']);

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        BuscarDireccionService,
        { provide: MapService, useValue: mapServiceMock },
      ],
    });
    service = TestBed.inject(BuscarDireccionService);

    // Asegurarse de que getMap devuelva el objeto mapMock
    mapServiceMock.getMap.and.returnValue(mapMock as ol.Map);

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit suggested directions when search results are returned', done => {
    const mockResults = [
      {
        lat: '40.7128',
        lon: '-74.0060',
        display_name: 'New York, NY, USA',
        place_id: '123',
      },
    ];

    const fetchMockResponse: Response = {
      json: () => Promise.resolve(mockResults),
    } as Response;

    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fetchMockResponse));

    service.direccionSugerida.subscribe(directions => {
      console.log('Directions emitted:', directions); // Verifica que se emiten los valores
      expect(directions).toEqual([
        {
          label: 'New York, NY, USA',
          placeId: '123',
          lat: '40.7128',
          lon: '-74.0060',
        },
      ]);
      done(); // Asegúrate de que se llame después de las verificaciones
    });

    service.buscarDireccionPorTexto('New York');
  });

  it('should emit empty array if no results are found', done => {
    const fetchMockResponse: Response = {
      json: () => Promise.resolve([]),
    } as Response;

    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fetchMockResponse));

    service.direccionSugerida.subscribe(directions => {
      expect(directions).toEqual([]);
      done();
    });

    service.buscarDireccionPorTexto('Invalid Address');
  });

  it('should handle errors gracefully when fetch fails', async () => {
    spyOn(window, 'fetch').and.returnValue(Promise.reject('Fetch error'));

    const consoleErrorSpy = spyOn(console, 'error');

    // Llamar al método asincrónico
    await service.buscarDireccionPorTexto('Error Address');

    // Verificar que se haya llamado a console.error con el mensaje adecuado
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error al buscar la dirección:',
      'Fetch error'
    );
  });

  it('should call the zoom animation when a direction is selected', () => {
    const direccion = {
      lat: '40.7128',
      lon: '-74.0060',
      label: 'New York',
      placeId: '123',
    };

    // Crear un mock para el método animate
    const mockView = jasmine.createSpyObj('View', ['animate']);

    // Asegurarse de que getView devuelva el mock de 'View'
    mapMock.getView = jasmine.createSpy('getView').and.returnValue(mockView);

    // Restablecer las llamadas de 'animate' antes de la prueba
    mockView.animate.calls.reset();

    // Ejecutar el método que debería activar la animación
    service.buscarDireccionSeleccionada(direccion);

    // Simular que la primera animación (zoom-out) ha finalizado llamando al callback manualmente
    mockView.animate.calls.argsFor(0)[1](); // Llamar al callback de la primera animación (zoom-out)

    // Ahora la segunda animación (zoom-in) debería haber sido llamada
    expect(mockView.animate).toHaveBeenCalledTimes(2); // Ahora esperamos dos llamadas a 'animate'
    expect(mockView.animate.calls.count()).toBe(2); // Deben llamarse dos veces: zoom-out y zoom-in
  });
});
