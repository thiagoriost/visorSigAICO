import { TestBed } from '@angular/core/testing';
import { DibujarService } from './dibujar.service';
import { MapService } from '@app/core/services/map-service/map.service';
import { Feature } from 'ol';
import { Style } from 'ol/style';
import { LineString, Polygon } from 'ol/geom';
import { Draw } from 'ol/interaction';
import BaseEvent from 'ol/events/Event';

class MapServiceMock {
  private map = {
    addInteraction: jasmine.createSpy('addInteraction'),
    removeInteraction: jasmine.createSpy('removeInteraction'),
    getViewport: jasmine
      .createSpy('getViewport')
      .and.returnValue(document.createElement('div')),
  };

  getMap() {
    return this.map;
  }

  getLayerGroupByName = jasmine
    .createSpy('getLayerGroupByName')
    .and.returnValue(null);
}

describe('DibujarService', () => {
  let service: DibujarService;
  let mapService: MapServiceMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DibujarService,
        { provide: MapService, useClass: MapServiceMock },
      ],
    });
    service = TestBed.inject(DibujarService);
    mapService = TestBed.inject(MapService) as unknown as MapServiceMock;
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debería actualizar el color de relleno y llamar a updateDrawingInteraction', () => {
    spyOn(service, 'updateDrawingInteraction').and.callThrough();
    service.updateFillColor('#ff0000');
    expect((service as DibujarService)['fillColor']).toBe('#ff0000');
    expect(service.updateDrawingInteraction).toHaveBeenCalled();
  });

  it('debería actualizar el color de contorno y llamar a updateDrawingInteraction', () => {
    spyOn(service, 'updateDrawingInteraction').and.callThrough();
    service.updateStrokeColor('#00ff00');
    expect((service as DibujarService)['strokeColor']).toBe('#00ff00');
    expect(service.updateDrawingInteraction).toHaveBeenCalled();
  });

  it('debería actualizar el grosor del contorno y llamar a updateDrawingInteraction', () => {
    spyOn(service, 'updateDrawingInteraction').and.callThrough();
    service.updateStrokeWidth(5);
    expect((service as DibujarService)['strokeWidth']).toBe(5);
    expect(service.updateDrawingInteraction).toHaveBeenCalled();
  });

  it('addInteraction debería añadir interacción de dibujo y configurar propiedades', () => {
    service.addInteraction('Point');
    const map = mapService.getMap();
    expect(map.addInteraction).toHaveBeenCalled();
    expect((service as DibujarService)['tipoGeometria']).toBe('Point');
  });

  it('addInteraction debería emitir longitud 0 y área 0 inicialmente', done => {
    let longitudEmitida = false;
    let areaEmitida = false;

    service.longitudSubject.subscribe(value => {
      expect(value).toBe(0);
      longitudEmitida = true;
      if (longitudEmitida && areaEmitida) done();
    });

    service.areaSubject.subscribe(value => {
      expect(value).toBe(0);
      areaEmitida = true;
      if (longitudEmitida && areaEmitida) done();
    });

    service.addInteraction('Point');
  });

  it('drawend debería calcular longitud para LineString y emitirla', done => {
    service.addInteraction('LineString');

    const fakeFeature = new Feature({
      geometry: new LineString([
        [0, 0],
        [0, 1],
      ]),
    });

    const drawInstance = (service as DibujarService)['draw'] as Draw | null;
    expect(drawInstance).toBeDefined();

    if (drawInstance) {
      service.longitudSubject.subscribe(value => {
        expect(value).toBeGreaterThan(0);
        done();
      });

      // Evento con tipo válido y propiedad `feature` agregada
      const drawEndEvent = Object.assign(new BaseEvent('drawend'), {
        feature: fakeFeature,
      });

      drawInstance.dispatchEvent(drawEndEvent);
    }
  });

  it('drawend debería calcular área para Polygon y emitirla', done => {
    service.addInteraction('Polygon');

    const fakeFeature = new Feature({
      geometry: new Polygon([
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
          [0, 0],
        ],
      ]),
    });

    const drawInstance = (service as DibujarService)['draw'] as Draw | null;
    expect(drawInstance).toBeDefined();

    if (drawInstance) {
      service.areaSubject.subscribe(value => {
        expect(value).toBeGreaterThan(0);
        done();
      });

      // Creamos un evento compatible con OL y le añadimos la feature
      const drawEndEvent = Object.assign(new BaseEvent('drawend'), {
        feature: fakeFeature,
      });

      drawInstance.dispatchEvent(drawEndEvent);
    }
  });

  it('deshacerDibujo debería eliminar última geometría y almacenarla en eliminadas', () => {
    const fakeFeature = new Feature();
    (service as DibujarService)['geometriaCreadas'].push({
      geometry: fakeFeature,
      style: new Style(),
    });
    spyOn(
      (service as DibujarService)['source'],
      'removeFeature'
    ).and.callThrough();

    service.deshacerDibujo();

    expect((service as DibujarService)['geometriaCreadas'].length).toBe(0);
    expect((service as DibujarService)['geometriaEliminadas'].length).toBe(1);
    expect(
      (service as DibujarService)['source'].removeFeature
    ).toHaveBeenCalledWith(fakeFeature);
  });

  it('recuperarDibujo debería restaurar la última geometría eliminada', () => {
    const fakeFeature = new Feature();
    const style = new Style();
    (service as DibujarService)['geometriaEliminadas'].push({
      geometry: fakeFeature,
      style,
    });
    spyOn(
      (service as DibujarService)['source'],
      'addFeature'
    ).and.callThrough();

    service.recuperarDibujo();

    expect((service as DibujarService)['geometriaEliminadas'].length).toBe(0);
    expect((service as DibujarService)['geometriaCreadas'].length).toBe(1);
    expect(
      (service as DibujarService)['source'].addFeature
    ).toHaveBeenCalledWith(fakeFeature);
  });

  it('borrarDibujo debería mover todas las geometrías creadas a eliminadas y limpiar el source', () => {
    const fakeFeature1 = new Feature();
    const fakeFeature2 = new Feature();
    (service as DibujarService)['geometriaCreadas'].push({
      geometry: fakeFeature1,
      style: new Style(),
    });
    (service as DibujarService)['geometriaCreadas'].push({
      geometry: fakeFeature2,
      style: new Style(),
    });

    spyOn((service as DibujarService)['source'], 'clear').and.callThrough();

    service.borrarDibujo();

    expect((service as DibujarService)['geometriaCreadas'].length).toBe(0);
    expect((service as DibujarService)['geometriaEliminadas'].length).toBe(2);
    expect((service as DibujarService)['source'].clear).toHaveBeenCalled();
  });
});
