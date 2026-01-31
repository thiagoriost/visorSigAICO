import { TestBed } from '@angular/core/testing';
import { MiniMapService } from './mini-map.service';
import { MapService } from '@app/core/services/map-service/map.service';
import { MapaBaseService } from '@app/shared/services/mapa-base/mapa-base.service';
import { MapasBase } from '@app/core/interfaces/enums/MapasBase.enum';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { Feature, MapEvent } from 'ol';
import Polygon from 'ol/geom/Polygon';
import { Style } from 'ol/style';

// ==============================
// Mocks de dependencias externas
// ==============================

class MockMapService {
  private mapaPrincipal: Map;

  constructor() {
    this.mapaPrincipal = new Map({
      target: document.createElement('div'),
      layers: [],
      view: new View({
        center: [0, 0],
        zoom: 5,
        resolution: 1,
      }),
      controls: [],
    });
  }

  getMap(): Map {
    return this.mapaPrincipal;
  }
}

class MockMapaBaseService {
  getLayerByName(base: MapasBase): TileLayer | undefined {
    void base;
    return new TileLayer({});
  }
}

describe('MiniMapService', () => {
  let service: MiniMapService;
  let mapaPrincipal: Map;
  let targetElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MiniMapService,
        { provide: MapService, useClass: MockMapService },
        { provide: MapaBaseService, useClass: MockMapaBaseService },
      ],
    });

    service = TestBed.inject(MiniMapService);
    const mapService = TestBed.inject(MapService) as unknown as MockMapService;
    mapaPrincipal = mapService.getMap();

    targetElement = document.createElement('div');
    document.body.appendChild(targetElement);

    spyOn(window, 'getComputedStyle').and.callFake(() => {
      return {
        getPropertyValue: (prop: string): string => {
          if (prop === '--primary-100') return '#abcdef';
          if (prop === '--primary-color') return '#123456';
          return '';
        },
      } as CSSStyleDeclaration;
    });
  });

  afterEach(() => {
    service.removeMiniMap();
    if (targetElement.parentNode) {
      targetElement.parentNode.removeChild(targetElement);
    }
  });

  // ==============================
  // Pruebas básicas
  // ==============================

  it('debería crearse el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debería crear el mini mapa correctamente', () => {
    service.createMiniMap(mapaPrincipal, targetElement);

    const miniMap = (service as unknown as { miniMap: Map | null }).miniMap;
    expect(miniMap).toBeTruthy();

    const miniMapLayer = (
      service as unknown as {
        miniMapLayer: TileLayer | undefined;
      }
    ).miniMapLayer;
    expect(miniMapLayer).toBeInstanceOf(TileLayer);

    const rectangleLayer = (
      service as unknown as {
        rectangleLayer: VectorLayer | null;
      }
    ).rectangleLayer;
    expect(rectangleLayer).toBeInstanceOf(VectorLayer);
  });

  it('debería eliminar el mini mapa correctamente', () => {
    service.createMiniMap(mapaPrincipal, targetElement);
    service.removeMiniMap();

    const miniMap = (service as unknown as { miniMap: Map | null }).miniMap;
    const rectangleLayer = (
      service as unknown as {
        rectangleLayer: VectorLayer | null;
      }
    ).rectangleLayer;

    expect(miniMap).toBeNull();
    expect(rectangleLayer).toBeNull();
  });

  // ==============================
  // Pruebas del rectángulo
  // ==============================

  it('debería crear un rectángulo con el estilo correcto', () => {
    const extent: number[] = [0, 0, 10, 10];
    const feature = (
      service as unknown as {
        createRectangleFeature(ext: number[]): Feature<Polygon>;
      }
    ).createRectangleFeature(extent);

    expect(feature).toBeInstanceOf(Feature);

    const geom = feature.getGeometry() as Polygon;
    const coords = geom.getCoordinates()[0];
    expect(coords.length).toBe(5);

    const style = feature.getStyle() as Style;
    expect(style).toBeTruthy();
    expect(style.getStroke()?.getColor()).toBe('#123456');
  });

  it('debería actualizar la capa vectorial del mini mapa', () => {
    service.createMiniMap(mapaPrincipal, targetElement);

    const extent = [0, 0, 5, 5];
    const feature = (
      service as unknown as {
        createRectangleFeature(ext: number[]): Feature<Polygon>;
      }
    ).createRectangleFeature(extent);

    (
      service as unknown as {
        updateMiniMapLayerWithFeature(f: Feature<Polygon>): void;
      }
    ).updateMiniMapLayerWithFeature(feature);

    const layer = (
      service as unknown as {
        rectangleLayer: VectorLayer | null;
      }
    ).rectangleLayer;

    expect(layer).toBeTruthy();
    const features = layer!.getSource()?.getFeatures() ?? [];
    expect(features[0]).toBe(feature);
  });

  // ==============================
  // Movimiento del mapa
  // ==============================

  it('debería centrar el mini mapa al mover el mapa principal', () => {
    service.createMiniMap(mapaPrincipal, targetElement);
    const miniMap = (service as unknown as { miniMap: Map | null }).miniMap!;
    const miniView = miniMap.getView();

    spyOn(miniView, 'animate').and.callFake(
      (opt: { center: number[]; duration: number; zoom?: number }) => {
        miniView.setCenter(opt.center);
        if (opt.zoom !== undefined) miniView.setZoom(opt.zoom);
      }
    );

    const evento: MapEvent = {
      frameState: {
        viewState: {
          center: [100, 200],
          zoom: 8,
          resolution: 1,
        },
        extent: [0, 0, 50, 50],
      },
    } as unknown as MapEvent;

    (
      service as unknown as { callBackMoveendEvent(e: MapEvent): void }
    ).callBackMoveendEvent(evento);

    expect(miniView.getCenter()).toEqual([100, 200]);
  });

  // ==============================
  // Cambio de capa base
  // ==============================

  it('debería cambiar la capa base del mini mapa', () => {
    service.createMiniMap(mapaPrincipal, targetElement);
    const anterior = (
      service as unknown as {
        miniMapLayer: TileLayer | undefined;
      }
    ).miniMapLayer;

    (
      service as unknown as { updateMiniMapLayer(b: MapasBase): void }
    ).updateMiniMapLayer(MapasBase.GOOGLE_SATELLITE);

    const nueva = (
      service as unknown as {
        miniMapLayer: TileLayer | undefined;
      }
    ).miniMapLayer;

    expect(nueva).toBeTruthy();
    expect(nueva).not.toBe(anterior);
  });

  // ==============================
  // Paneo
  // ==============================

  it('debería habilitar y deshabilitar el paneo', () => {
    service.createMiniMap(mapaPrincipal, targetElement);

    service.setPanEnabled(true);
    const isPanEnabledTrue = (
      service as unknown as {
        isPanEnabled: boolean;
      }
    ).isPanEnabled;
    expect(isPanEnabledTrue).toBeTrue();

    service.setPanEnabled(false);
    const isPanEnabledFalse = (
      service as unknown as {
        isPanEnabled: boolean;
      }
    ).isPanEnabled;
    expect(isPanEnabledFalse).toBeFalse();
  });
});
