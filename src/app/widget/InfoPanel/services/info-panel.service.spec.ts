import { TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { Map, Overlay } from 'ol';
import { Coordinate } from 'ol/coordinate';

import { InfoPanelService } from './info-panel.service';
import { MapService } from '@app/core/services/map-service/map.service';

/**
 * Mock del servicio MapService para aislar las pruebas.
 * Simula un mapa con métodos básicos de overlays.
 */
class MockMapService {
  private mockMap = {
    addOverlay: jasmine.createSpy('addOverlay'),
    removeOverlay: jasmine.createSpy('removeOverlay'),
  };

  public getMap(): Map {
    return this.mockMap as unknown as Map;
  }
}

describe('InfoPanelService', () => {
  let service: InfoPanelService;
  let mockMapService: MockMapService;

  // Helper tipado para acceder a propiedades privadas en pruebas
  const getArrayPopups = (): { id: number; overlay: Overlay }[] => {
    return (
      service as unknown as {
        arrayPopups: {
          id: number;
          overlay: Overlay;
        }[];
      }
    ).arrayPopups;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        InfoPanelService,
        { provide: MapService, useClass: MockMapService },
      ],
    });

    service = TestBed.inject(InfoPanelService);
    mockMapService = TestBed.inject(MapService) as unknown as MockMapService;
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('createPopup', () => {
    it('debería crear un nuevo popup y añadirlo al mapa', () => {
      const mockElement = new ElementRef(document.createElement('div'));
      const mockCoordinates: Coordinate = [10, 20];

      const id = service.createPopup(mockCoordinates, mockElement);

      expect(mockMapService.getMap().addOverlay).toHaveBeenCalledTimes(1);
      expect(getArrayPopups().length).toBe(1);
      expect(getArrayPopups()[0].id).toBe(id);
    });

    it('debería lanzar un error si no hay un mapa disponible', () => {
      spyOn(mockMapService, 'getMap').and.returnValue(
        undefined as unknown as Map
      );
      const mockElement = new ElementRef(document.createElement('div'));
      const mockCoordinates: Coordinate = [10, 20];

      expect(() =>
        service.createPopup(mockCoordinates, mockElement)
      ).toThrowError('No hay mapa disponible');
    });
  });

  describe('updatePopupCoords', () => {
    it('debería actualizar la posición del popup si existe', () => {
      const mockElement = new ElementRef(document.createElement('div'));
      const initialCoords: Coordinate = [10, 20];
      const id = service.createPopup(initialCoords, mockElement);

      const overlay = getArrayPopups()[0].overlay;
      spyOn(overlay, 'setPosition');

      const newCoords: Coordinate = [30, 40];
      service.updatePopupCoords(id, newCoords);

      expect(overlay.setPosition).toHaveBeenCalledWith(newCoords);
    });

    it('no debería hacer nada si el id no existe', () => {
      service.updatePopupCoords(999, [50, 60]);
      // Si no existe el id, simplemente no ocurre nada
      expect(getArrayPopups().length).toBe(0);
    });
  });

  describe('closePopup', () => {
    it('debería cerrar el popup y removerlo del mapa', () => {
      const mockElement = new ElementRef(document.createElement('div'));
      const coords: Coordinate = [10, 20];
      const id = service.createPopup(coords, mockElement);

      const map = mockMapService.getMap();
      service.closePopup(id);

      expect(map.removeOverlay).toHaveBeenCalledTimes(1);
      expect(getArrayPopups().length).toBe(0);
    });

    it('no debería hacer nada si el id no existe', () => {
      const map = mockMapService.getMap();
      service.closePopup(999);

      expect(map.removeOverlay).not.toHaveBeenCalled();
      expect(getArrayPopups().length).toBe(0);
    });
  });

  describe('closeAllPopups', () => {
    it('debería cerrar todos los popups abiertos', () => {
      const mockElement1 = new ElementRef(document.createElement('div'));
      const mockElement2 = new ElementRef(document.createElement('div'));
      service.createPopup([10, 20], mockElement1);
      service.createPopup([30, 40], mockElement2);

      const map = mockMapService.getMap();
      service.closeAllPopups();

      expect(map.removeOverlay).toHaveBeenCalledTimes(2);
      expect(getArrayPopups().length).toBe(0);
    });
  });
});
