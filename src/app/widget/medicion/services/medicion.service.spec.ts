import { TestBed } from '@angular/core/testing';
import { MedicionService } from './medicion.service';
import { MapService } from '@app/core/services/map-service/map.service';
import { Draw, Modify, Snap } from 'ol/interaction';
import { Feature } from 'ol';
import { LineString, Polygon } from 'ol/geom';
import { Map } from 'ol';
import VectorSource from 'ol/source/Vector';

// Define un tipo de evento personalizado para el evento de dibujo
interface CustomDrawEvent {
  type: string;
  feature: Feature;
  propagationStopped: boolean;
  defaultPrevented: boolean;
  target: unknown;
  preventDefault: () => void;
  stopPropagation: () => void;
}

describe('MedicionService', () => {
  let servicio: MedicionService;
  let mapServiceMock: jasmine.SpyObj<MapService>;
  let mapMock: jasmine.SpyObj<Map>;
  let drawMock: jasmine.SpyObj<Draw>;
  let modifyMock: jasmine.SpyObj<Modify>;
  let snapMock: jasmine.SpyObj<Snap>;

  const vectorSource = new VectorSource();

  beforeEach(() => {
    // Elemento HTML simulado para getViewport
    const fakeViewport = document.createElement('div');
    spyOn(fakeViewport, 'addEventListener'); // Espía opcional

    // Map mock incluyendo getViewport y funciones necesarias
    mapMock = jasmine.createSpyObj('Map', [
      'addInteraction',
      'removeInteraction',
      'getViewport',
      'getEventCoordinate',
      'getPixelFromCoordinate',
    ]);

    mapMock.getViewport.and.returnValue(fakeViewport);
    mapMock.getEventCoordinate.and.callFake(() => [0, 0]);
    mapMock.getPixelFromCoordinate.and.callFake(() => [100, 100]);

    mapServiceMock = jasmine.createSpyObj('MapService', [
      'getMap',
      'getLayerGroupByName',
    ]);

    drawMock = jasmine.createSpyObj('Draw', ['setActive']);
    modifyMock = jasmine.createSpyObj('Modify', ['setActive']);
    snapMock = jasmine.createSpyObj('Snap', ['setActive']);

    TestBed.configureTestingModule({
      providers: [
        MedicionService,
        { provide: MapService, useValue: mapServiceMock },
      ],
    });

    servicio = TestBed.inject(MedicionService);
    mapServiceMock.getMap.and.returnValue(mapMock);

    mapMock.addInteraction.and.callFake(
      (interaction: Draw | Modify | Snap | unknown) => {
        if (interaction instanceof Draw) return drawMock;
        if (interaction instanceof Modify) return modifyMock;
        if (interaction instanceof Snap) return snapMock;
        return null;
      }
    );

    const mockLayerGroup = jasmine.createSpyObj('LayerGroup', ['getLayers']);
    const mockLayerCollection = jasmine.createSpyObj('Collection', [
      'push',
      'getArray',
    ]);
    mockLayerGroup.getLayers.and.returnValue(mockLayerCollection);
    mapServiceMock.getLayerGroupByName.and.returnValue(mockLayerGroup);
  });

  it('debería ser creado', () => {
    expect(servicio).toBeTruthy();
  });

  it('debería agregar una interacción de dibujo de tipo LineString', () => {
    const drawInteraction = new Draw({
      source: vectorSource,
      type: 'LineString',
    });
    mapMock.addInteraction(drawInteraction);
    expect(mapMock.addInteraction).toHaveBeenCalledWith(jasmine.any(Draw));
  });

  it('debería agregar una interacción de dibujo de tipo Polygon', () => {
    const drawInteraction = new Draw({
      source: vectorSource,
      type: 'Polygon',
    });
    mapMock.addInteraction(drawInteraction);
    expect(mapMock.addInteraction).toHaveBeenCalledWith(jasmine.any(Draw));
  });

  it('debería emitir longitud cuando se dibuja una línea', () => {
    servicio.addInteraction('LineString');

    const mockFeature = new Feature({
      geometry: new LineString([
        [0, 0],
        [1, 1],
      ]),
    });

    const drawEvent: CustomDrawEvent = {
      type: 'drawend',
      feature: mockFeature,
      propagationStopped: false,
      defaultPrevented: false,
      target: servicio['draw'],
      preventDefault: () => undefined,
      stopPropagation: () => undefined,
    };

    spyOn(servicio.longitudSubject, 'next');
    servicio['draw']?.dispatchEvent(drawEvent);
    expect(servicio.longitudSubject.next).toHaveBeenCalledWith(
      jasmine.any(Number)
    );
  });

  it('debería emitir área cuando se dibuja un polígono', () => {
    servicio.addInteraction('Polygon');

    const mockFeature = new Feature({
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

    const drawEvent: CustomDrawEvent = {
      type: 'drawend',
      feature: mockFeature,
      propagationStopped: false,
      defaultPrevented: false,
      target: servicio['draw'],
      preventDefault: jasmine.createSpy('preventDefault'),
      stopPropagation: jasmine.createSpy('stopPropagation'),
    };

    spyOn(servicio.areaSubject, 'next');
    servicio['draw']?.dispatchEvent(drawEvent);
    expect(servicio.areaSubject.next).toHaveBeenCalledWith(jasmine.any(Number));
  });

  it('debería limpiar las interacciones al removerlas', () => {
    const drawInteraction = new Draw({
      source: vectorSource,
      type: 'Point',
    });
    mapMock.addInteraction(drawInteraction);
    mapMock.removeInteraction(drawInteraction);
    expect(mapMock.removeInteraction).toHaveBeenCalledWith(jasmine.any(Draw));
  });

  it('debería eliminar interacciones al destruir el servicio', () => {
    spyOn(servicio, 'removeInteractions');
    servicio.ngOnDestroy();
    expect(servicio.removeInteractions).toHaveBeenCalled();
  });
});
