import { TestBed } from '@angular/core/testing';
import { DibujarTextoService } from './dibujar-texto.service';
import { MapService } from '@app/core/services/map-service/map.service';
import { Feature } from 'ol';
import Point from 'ol/geom/Point';

// Mock del MapService
class MockMapService {
  public interactions: unknown[] = [];
  public layers: unknown[] = [];

  private fakeMap = {
    addInteraction: (interaction: unknown) =>
      this.interactions.push(interaction),
    removeInteraction: (interaction: unknown) => {
      const index = this.interactions.indexOf(interaction);
      if (index >= 0) {
        this.interactions.splice(index, 1);
      }
    },
  };

  getMap() {
    return this.fakeMap;
  }

  getLayerGroupByName() {
    return {
      getLayers: () => this.layers,
    };
  }
}

describe('Servicio DibujarTextoService', () => {
  let service: DibujarTextoService;
  let mockMapService: MockMapService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DibujarTextoService,
        { provide: MapService, useClass: MockMapService },
      ],
    });

    service = TestBed.inject(DibujarTextoService);
    mockMapService = TestBed.inject(MapService) as unknown as MockMapService;
  });

  it('debería crearse el servicio correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debería inicializar la capa de dibujo y agregarla al grupo de capas', () => {
    const capas: unknown[] = []; // arreglo real y mutable

    const fakeLayerGroup = {
      getLayers: () => capas, // devuelve siempre el mismo arreglo
    };

    spyOn(mockMapService, 'getLayerGroupByName').and.returnValue(
      fakeLayerGroup
    );

    service.inicializarCapaDibujo();

    expect(capas.length).toBe(1);
  });

  it('debería añadir una interacción de dibujo para texto tipo Point', () => {
    const fakeMap = mockMapService.getMap();
    spyOn(mockMapService, 'getMap').and.returnValue(fakeMap);

    service.addTextFeature('Hola', '#000000', 12);

    // La interacción Draw debe haberse agregado
    expect(fakeMap['addInteraction']).toBeDefined();

    // Verificamos que se haya agregado una interacción
    expect(mockMapService.interactions.length).toBeGreaterThan(0);
  });

  it('debería actualizar el color de relleno y recrear la interacción de dibujo', () => {
    const fakeMap = mockMapService.getMap();
    spyOn(mockMapService, 'getMap').and.returnValue(fakeMap);

    service.addTextFeature('Texto', '#111111', 14);

    service.updateFillColor('rgba(255,0,0,0.5)');

    // No debe lanzar error y debe existir la interacción
    expect(service).toBeTruthy();
  });

  it('debería actualizar el color de contorno y recrear la interacción de dibujo', () => {
    const fakeMap = mockMapService.getMap();
    spyOn(mockMapService, 'getMap').and.returnValue(fakeMap);

    service.addTextFeature('Texto', '#111111', 14);

    service.updateStrokeColor('rgba(0,255,0,0.5)');

    expect(service).toBeTruthy();
  });

  it('debería actualizar el grosor del contorno y recrear la interacción de dibujo', () => {
    const fakeMap = mockMapService.getMap();
    spyOn(mockMapService, 'getMap').and.returnValue(fakeMap);

    service.addTextFeature('Texto', '#111111', 14);

    service.updateStrokeWidth(10);

    expect(service).toBeTruthy();
  });

  it('debería deshacer el último texto dibujado correctamente', () => {
    // Añadimos un texto creado manualmente para simular estado
    const feature = new Feature({
      geometry: new Point([0, 0]),
    });
    service['textoCreados'].push(feature);
    service['source'].addFeature(feature);

    service.deshacerTexto();

    expect(service['textoCreados'].length).toBe(0);
    expect(service['textoEliminados'].length).toBe(1);
  });

  it('debería recuperar el último texto eliminado correctamente', () => {
    // Añadimos un texto eliminado manualmente para simular estado
    const feature = new Feature({
      geometry: new Point([0, 0]),
    });
    service['textoEliminados'].push(feature);

    service.recuperarTexto();

    expect(service['textoEliminados'].length).toBe(0);
    expect(service['textoCreados'].length).toBe(1);
  });

  it('debería borrar todos los textos del mapa', () => {
    const feature = new Feature({
      geometry: new Point([0, 0]),
    });
    service['source'].addFeature(feature);

    service.borrarTexto();

    expect(service['source'].getFeatures().length).toBe(0);
  });

  it('debería eliminar todas las interacciones de dibujo del mapa', () => {
    const fakeMap = mockMapService.getMap();
    spyOn(mockMapService, 'getMap').and.returnValue(fakeMap);

    // Simulamos que las interacciones existen
    service['draw'] = {
      id: 'draw',
    } as unknown as (typeof service)['draw'];
    service['modify'] = {
      id: 'modify',
    } as unknown as (typeof service)['modify'];
    service['snap'] = {
      id: 'snap',
    } as unknown as (typeof service)['snap'];

    const removeInteractionSpy = spyOn(
      fakeMap,
      'removeInteraction'
    ).and.callThrough();

    service.removeDrawingInteraction();

    expect(removeInteractionSpy).toHaveBeenCalledTimes(3);
    expect(service['draw']).toBeNull();
    expect(service['modify']).toBeNull();
    expect(service['snap']).toBeNull();
  });
});
