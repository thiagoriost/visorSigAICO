import { TestBed } from '@angular/core/testing';
import { EscalaService } from './escala.service';
import { MapService } from '@app/core/services/map-service/map.service';
import { Map, View } from 'ol';
import { Projection } from 'ol/proj';
import { ElementRef } from '@angular/core';
import { Escala } from '../interface/escala';

describe('EscalaService', () => {
  let service: EscalaService;
  let mockMap: jasmine.SpyObj<Map>;
  let mockView: jasmine.SpyObj<View>;
  let mockMapService: jasmine.SpyObj<MapService>;

  beforeEach(() => {
    // Mock de View con spy para getProjection y on
    const mockProjection = new Projection({
      code: 'EPSG:3857',
      units: 'm',
    });

    mockView = jasmine.createSpyObj('View', [
      'getResolution',
      'setResolution',
      'getProjection',
      'on',
    ]);
    mockView.getProjection.and.returnValue(mockProjection);
    mockView.getResolution.and.returnValue(100);

    // Mock de Map que retorna la vista espía
    mockMap = jasmine.createSpyObj('Map', ['getView', 'addControl']);
    mockMap.getView.and.returnValue(mockView);

    // Mock de MapService que retorna el mapa espía
    mockMapService = jasmine.createSpyObj('MapService', ['getMap']);
    mockMapService.getMap.and.returnValue(mockMap);

    TestBed.configureTestingModule({
      providers: [
        EscalaService,
        { provide: MapService, useValue: mockMapService },
      ],
    });

    service = TestBed.inject(EscalaService);
  });

  it('debería crearse', () => {
    expect(service).toBeTruthy();
  });

  it('debería retornar la lista de escalas', () => {
    const escalas = service.getEscalas();
    expect(escalas.length).toBeGreaterThan(0);
    expect(escalas[0].nombre).toBe('1:1.000');
  });

  it('debería calcular resolución a partir de escala', () => {
    const resolution = service.getResolutionFromScale(10000);
    expect(resolution).toBeGreaterThan(0);
  });

  it('debería obtener la resolución actual del mapa', () => {
    const resolution = service.getCurrentResolution(mockMap);
    expect(resolution).toBe(100);
  });

  it('debería calcular metros por unidad para EPSG:3857', () => {
    const metros = service.getMetersPerUnit('EPSG:3857');
    expect(metros).toBeGreaterThan(0);
  });

  it('debería calcular la escala actual del mapa', () => {
    const escala = service.getCurrentScale(mockMap);
    expect(escala).toBeGreaterThan(0);
  });

  it('debería generar escala gráfica en metros o km', () => {
    const textoEscala = service.getEscalaGrafica(mockMap, 100);
    expect(typeof textoEscala).toBe('string');
    expect(textoEscala.includes('m') || textoEscala.includes('km')).toBeTrue();
  });

  it('debería devolver la escala más cercana', () => {
    const escala = service.getEscalaMasCercana(10500); // cerca de 1:10.000
    expect(escala.valor).toBe(10000);
  });

  it('debería actualizar la escala seleccionada correctamente', () => {
    service['escalaSelectedSubject'].next({
      id: 3,
      nombre: '1:5.000',
      valor: 5000,
    });
    spyOn(service, 'getCurrentScale').and.returnValue(10000);
    service.updateEscala();
    service.escalaSelected$.subscribe(escala => {
      expect(escala.valor).toBe(10000);
    });
  });

  it('debería cambiar resolución del mapa al seleccionar una escala', () => {
    const escala: Escala = { id: 4, nombre: '1:10.000', valor: 10000 };
    service.onChangeEscala(escala);
    expect(service['escalaSelectedSubject'].value).toEqual(escala);
    expect(mockView.setResolution).toHaveBeenCalled();
  });

  it('debería inicializar el control de escala y agregarlo al mapa', () => {
    const div = document.createElement('div');
    const elementRef = new ElementRef<HTMLDivElement>(div);

    service.initScaleLineControl(elementRef);

    expect(mockMap.addControl).toHaveBeenCalled();
    expect(service.scaleLineControl).toBeDefined();
  });
});
