import { NavButtonsMapService } from './nav-buttons-map.service';
import { MapService } from '@app/core/services/map-service/map.service';
import { MouseWheelZoom, Interaction } from 'ol/interaction';
import { View, Map } from 'ol';
import Collection from 'ol/Collection';
import { MapaBaseService } from '@app/shared/services/mapa-base/mapa-base.service';

// Implementación completa de MapService mock
class MockMapService extends MapService {
  constructor() {
    super(new MapaBaseService() as unknown as MapaBaseService);
  }

  override getMap = jasmine.createSpy('getMap');
  override createMap = jasmine.createSpy('createMap');
  override getLayerGroupByName = jasmine.createSpy('getLayerGroupByName');
  override addLayer = jasmine.createSpy('addLayer');
  override removeLayer = jasmine.createSpy('removeLayer');
  override showOrHideLayer = jasmine.createSpy('showOrHideLayer');
  override generateTransparency = jasmine.createSpy('generateTransparency');
  override identify = jasmine.createSpy('identify');
  override getLayerByDefinition = jasmine.createSpy('getLayerByDefinition');
}

// Implementación de View con métodos espía
class MockView extends View {
  constructor() {
    super({});
    // Asignar espías directamente a los métodos
    this.getZoom = jasmine
      .createSpy('getZoom')
      .and.callFake(() => super.getZoom());
    this.setCenter = jasmine
      .createSpy('setCenter')
      .and.callFake(center => super.setCenter(center));
    this.setZoom = jasmine
      .createSpy('setZoom')
      .and.callFake(zoom => super.setZoom(zoom));
  }
}

// Implementación de Map con métodos espía
class MockMap extends Map {
  constructor(view: View) {
    super({ view });
    // Asignar espías directamente a los métodos
    this.getView = jasmine
      .createSpy('getView')
      .and.callFake(() => super.getView());
    this.getInteractions = jasmine
      .createSpy('getInteractions')
      .and.callFake(() => super.getInteractions());
    this.addInteraction = jasmine
      .createSpy('addInteraction')
      .and.callFake(interaction => super.addInteraction(interaction));
    this.removeInteraction = jasmine
      .createSpy('removeInteraction')
      .and.callFake(interaction => super.removeInteraction(interaction));
  }
}

describe('NavButtonsMapService', () => {
  let service: NavButtonsMapService;
  let mapServiceMock: MockMapService;
  let mapMock: MockMap;
  let viewMock: MockView;

  beforeEach(() => {
    // Crear instancias de mocks
    viewMock = new MockView();
    mapMock = new MockMap(viewMock);
    mapServiceMock = new MockMapService();

    // Configurar el mock para devolver el mapa
    mapServiceMock.getMap.and.returnValue(mapMock);

    // Inicializar zoom
    viewMock.setZoom(5);

    service = new NavButtonsMapService(mapServiceMock);
  });

  describe('resetView', () => {
    it('debe establecer centro y zoom cuando el mapa y vista están disponibles', () => {
      const initialCenter = [10, 20];
      const initialZoom = 8;

      service.resetView(initialCenter, initialZoom);

      expect(viewMock.setCenter).toHaveBeenCalledWith(initialCenter);
      expect(viewMock.setZoom).toHaveBeenCalledWith(initialZoom);
    });

    it('debe mostrar warning si el mapa no está disponible', () => {
      mapServiceMock.getMap.and.returnValue(null);
      const consoleWarnSpy = spyOn(console, 'warn');

      service.resetView([0, 0], 1);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'El mapa no está disponible aún.'
      );
    });

    it('debe mostrar warning si no se puede obtener el zoom actual', () => {
      // Sobrescribir getView para devolver null
      mapMock.getView = jasmine.createSpy().and.returnValue(null);
      const consoleWarnSpy = spyOn(console, 'warn');

      service.resetView([0, 0], 1);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'No se pudo obtener la vista actual.'
      );
    });
  });

  describe('toggleMouseWheelZoom', () => {
    it('debe añadir interacción al activar con enable=true', () => {
      service.toggleMouseWheelZoom(true);

      // Verificar que se llamó a addInteraction
      expect(mapMock.addInteraction).toHaveBeenCalled();

      // Verificar que se añadió una instancia de MouseWheelZoom
      // Acceder a la propiedad 'calls' mediante una aserción de tipo segura
      const addInteractionSpy = mapMock.addInteraction as jasmine.Spy;
      const addedInteraction = addInteractionSpy.calls.mostRecent().args[0];
      expect(addedInteraction).toBeInstanceOf(MouseWheelZoom);
    });

    it('no debe añadir duplicados si ya está activo', () => {
      // Primera activación
      service.toggleMouseWheelZoom(true);

      // Acceder a la propiedad 'calls' mediante una aserción de tipo segura
      const addInteractionSpy = mapMock.addInteraction as jasmine.Spy;
      addInteractionSpy.calls.reset();

      // Segunda activación
      service.toggleMouseWheelZoom(true);

      expect(mapMock.addInteraction).not.toHaveBeenCalled();
    });

    it('debe remover todas las interacciones MouseWheelZoom al desactivar', () => {
      // Añadir interacción de prueba
      const mockInteraction = new MouseWheelZoom();

      // Configurar interacciones existentes
      const interactions = new Collection<Interaction>([mockInteraction]);
      mapMock.getInteractions = jasmine
        .createSpy()
        .and.returnValue(interactions);

      service.toggleMouseWheelZoom(false);

      expect(mapMock.removeInteraction).toHaveBeenCalledWith(mockInteraction);
    });

    it('debe manejar mapa no disponible', () => {
      mapServiceMock.getMap.and.returnValue(null);
      const consoleWarnSpy = spyOn(console, 'warn');

      service.toggleMouseWheelZoom(true);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'El mapa no está disponible aún.'
      );
    });
  });

  describe('zoomIn', () => {
    it('debe aumentar el zoom en 1 nivel', () => {
      viewMock.getZoom = jasmine.createSpy().and.returnValue(5);
      service.zoomIn();

      expect(viewMock.setZoom).toHaveBeenCalledWith(6);
    });

    it('debe manejar vista no disponible', () => {
      mapMock.getView = jasmine.createSpy().and.returnValue(null);
      const consoleWarnSpy = spyOn(console, 'warn');

      service.zoomIn();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'La vista no está disponible aún.'
      );
    });

    it('debe manejar mapa no disponible', () => {
      mapServiceMock.getMap.and.returnValue(null);
      const consoleWarnSpy = spyOn(console, 'warn');

      service.zoomIn();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'El mapa no está disponible aún.'
      );
    });
  });

  describe('zoomOut', () => {
    it('debe disminuir el zoom en 1 nivel', () => {
      viewMock.getZoom = jasmine.createSpy().and.returnValue(5);
      service.zoomOut();

      expect(viewMock.setZoom).toHaveBeenCalledWith(4);
    });

    it('debe manejar vista no disponible', () => {
      mapMock.getView = jasmine.createSpy().and.returnValue(null);
      const consoleWarnSpy = spyOn(console, 'warn');

      service.zoomOut();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'La vista no está disponible aún.'
      );
    });

    it('debe manejar mapa no disponible', () => {
      mapServiceMock.getMap.and.returnValue(null);
      const consoleWarnSpy = spyOn(console, 'warn');

      service.zoomOut();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'El mapa no está disponible aún.'
      );
    });
  });
});
