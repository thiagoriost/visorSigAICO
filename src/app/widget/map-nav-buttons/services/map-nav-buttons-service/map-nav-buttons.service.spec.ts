import { TestBed } from '@angular/core/testing';
import { MapService } from '@app/core/services/map-service/map.service';
import { MapNavButtonsService } from './map-nav-buttons.service';
import { Map } from 'ol';
import { DragBox } from 'ol/interaction';
import { EventsKey } from 'ol/events';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import BaseEvent from 'ol/events/Event';
import { Extent, getCenter } from 'ol/extent';
import { Polygon } from 'ol/geom';
import { firstValueFrom } from 'rxjs';

// Mock para la vista del mapa
class MockView {
  private _zoom = 10;
  private _center: number[] = [0, 0];
  private _resolution = 1;
  private _minZoom = 2;
  private _maxZoom = 18;
  private listeners: Record<string, ((event: Event | BaseEvent) => void)[]> =
    {};

  getZoom(): number | undefined {
    return this._zoom;
  }

  setZoom(zoom: number): void {
    this._zoom = zoom;
    this.dispatchEvent('change:resolution');
  }

  getCenter(): number[] | undefined {
    return this._center;
  }

  setCenter(center: number[]): void {
    this._center = center;
  }

  getResolution(): number | undefined {
    return this._resolution;
  }

  setResolution(resolution: number): void {
    this._resolution = resolution;
  }

  getMinZoom(): number {
    return this._minZoom;
  }

  getMaxZoom(): number {
    return this._maxZoom;
  }

  fit(extent: Extent, options?: { duration?: number; maxZoom?: number }): void {
    this._center = getCenter(extent);
    this._zoom = options?.maxZoom || this._zoom;
  }

  on(
    type: string | string[],
    listener: (event: Event | BaseEvent) => void
  ): EventsKey {
    const eventType = Array.isArray(type) ? type[0] : type;
    if (!this.listeners[eventType]) this.listeners[eventType] = [];
    this.listeners[eventType].push(listener);
    return { type: eventType, listener } as EventsKey;
  }

  un(
    type: string | string[],
    listener: (event: Event | BaseEvent) => void
  ): void {
    const eventType = Array.isArray(type) ? type[0] : type;
    if (this.listeners[eventType]) {
      this.listeners[eventType] = this.listeners[eventType].filter(
        l => l !== listener
      );
    }
  }

  dispatchEvent(type: string): void {
    const listeners = this.listeners[type] || [];
    listeners.forEach(listener => listener(new BaseEvent(type)));
  }
}

// Mock para el mapa
class MockMap {
  private view: MockView;
  private interactions: DragBox[] = [];
  private layers: VectorLayer<VectorSource>[] = [];
  private viewport: HTMLElement = document.createElement('div');

  constructor(view: MockView) {
    this.view = view;
  }

  getView(): MockView {
    return this.view;
  }

  getViewport(): HTMLElement {
    return this.viewport;
  }

  addInteraction(interaction: DragBox): void {
    this.interactions.push(interaction);
  }

  removeInteraction(interaction: DragBox): void {
    this.interactions = this.interactions.filter(i => i !== interaction);
  }

  getInteractions(): {
    forEach: (cb: (i: DragBox) => void) => void;
    getArray: () => DragBox[];
  } {
    return {
      forEach: cb => this.interactions.forEach(cb),
      getArray: () => this.interactions,
    };
  }

  addLayer(layer: VectorLayer<VectorSource>): void {
    this.layers.push(layer);
  }

  removeLayer(layer: VectorLayer<VectorSource>): void {
    this.layers = this.layers.filter(l => l !== layer);
  }

  getLayers(): { getArray: () => VectorLayer<VectorSource>[] } {
    return {
      getArray: () => this.layers,
    };
  }

  getSize(): [number, number] | undefined {
    return [800, 600];
  }

  getEventCoordinate(event: Event): number[] {
    // Usamos el evento para simular coordenadas basadas en el tipo
    return event instanceof PointerEvent ? [100, 100] : [0, 0];
  }
}

describe('MapNavButtonsService', () => {
  let service: MapNavButtonsService;
  let mapService: jasmine.SpyObj<MapService>;
  let mockMap: MockMap;
  let mockView: MockView;

  beforeEach(() => {
    mockView = new MockView();
    mockMap = new MockMap(mockView);

    mapService = jasmine.createSpyObj<MapService>('MapService', ['getMap']);
    mapService.getMap.and.returnValue(mockMap as unknown as Map);

    TestBed.configureTestingModule({
      providers: [
        MapNavButtonsService,
        { provide: MapService, useValue: mapService },
      ],
    });

    service = TestBed.inject(MapNavButtonsService);
  });

  /**
   * @description Verifica que el servicio se cree correctamente.
   * @expects El servicio debe estar definido y ser una instancia de MapNavButtonsService.
   */
  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
    expect(service).toBeInstanceOf(MapNavButtonsService);
  });

  describe('constructor', () => {
    /**
     * @description Verifica que el constructor maneja el caso en el que el mapa no está disponible.
     * @given MapService.getMap retorna null.
     * @expects Emite un console.warn indicando que el mapa no está disponible.
     */
    it('debería manejar el caso de mapa no disponible en el constructor', () => {
      spyOn(console, 'warn');
      mapService.getMap.and.returnValue(null);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          MapNavButtonsService,
          { provide: MapService, useValue: mapService },
        ],
      });
      service = TestBed.inject(MapNavButtonsService);
      expect(console.warn).toHaveBeenCalledWith(
        'El mapa no está disponible aún.'
      );
    });
  });

  describe('startZoomBox', () => {
    /**
     * @description Verifica que startZoomBox configura el cursor y añade la interacción DragBox para zoom in.
     * @given Un mapa y vista válidos, zoomIn en true.
     * @expects Cambia el cursor a 'crosshair', añade una capa vectorial y activa isDrawingZoomBox$.
     */
    it('debería configurar el cursor y añadir interacción DragBox para zoom in', async () => {
      service.startZoomBox(true);
      expect(mockMap.getViewport().style.cursor).toBe('crosshair');
      expect(mockMap.getInteractions().getArray().length).toBe(1);
      expect(
        mockMap.getInteractions().getArray()[0] instanceof DragBox
      ).toBeTrue();
      expect(mockMap.getLayers().getArray().length).toBe(1);
      expect(await firstValueFrom(service.isDrawingZoomBox$)).toBeTrue();
    });

    /**
     * @description Verifica que startZoomBox maneja un clic simple para zoom in.
     * @given Un clic simple (pointerdown seguido de pointerup rápido).
     * @expects Aumenta el zoom en 1 y centra el mapa en las coordenadas del clic.
     */
    it('debería realizar zoom in con un clic simple', async () => {
      const initialZoom = mockView.getZoom()!;
      service.startZoomBox(true);
      const viewport = mockMap.getViewport();

      const pointerDownEvent = new PointerEvent('pointerdown');
      viewport.dispatchEvent(pointerDownEvent);

      const pointerUpEvent = new PointerEvent('pointerup');
      viewport.dispatchEvent(pointerUpEvent);

      expect(mockView.getZoom()).toBe(initialZoom + 1);
      expect(mockView.getCenter()).toEqual([100, 100]);
      expect(mockMap.getViewport().style.cursor).toBe('crosshair');
      expect(await firstValueFrom(service.isDrawingZoomBox$)).toBeTrue();
    });

    /**
     * @description Verifica que startZoomBox cancela con la tecla Escape.
     * @given ZoomBox activo y tecla Escape presionada.
     * @expects Elimina interacciones, restaura el cursor y desactiva isDrawingZoomBox$.
     */
    it('debería cancelar el zoomBox al presionar Escape', async () => {
      spyOn(mockMap, 'removeInteraction');
      service.startZoomBox(true);
      const keyEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(keyEvent);

      expect(mockMap.removeInteraction).toHaveBeenCalled();
      expect(mockMap.getViewport().style.cursor).toBe('default');
      expect(await firstValueFrom(service.isDrawingZoomBox$)).toBeFalse();
    });

    /**
     * @description Verifica que startZoomBox realiza zoom in al completar un drag box.
     * @given Un rectángulo dibujado con DragBox.
     * @expects Ajusta la vista al extent del rectángulo y limpia la capa.
     */
    it('debería realizar zoom in al completar un drag box', () => {
      const viewSpy = spyOn(mockView, 'fit');
      service.startZoomBox(true);

      const dragBox = mockMap.getInteractions().getArray()[0] as DragBox;
      const mockGeometry = new Polygon([
        [
          [0, 0],
          [0, 100],
          [100, 100],
          [100, 0],
          [0, 0],
        ],
      ]);
      spyOn(dragBox, 'getGeometry').and.returnValue(mockGeometry);

      dragBox.dispatchEvent('boxstart');
      dragBox.dispatchEvent('boxdrag');
      dragBox.dispatchEvent('boxend');

      expect(viewSpy).toHaveBeenCalledWith(
        [0, 0, 100, 100],
        jasmine.objectContaining({ duration: 250 })
      );
      expect(mockMap.getViewport().style.cursor).toBe('crosshair');
    });

    /**
     * @description Verifica que startZoomBox respeta los límites de zoom al hacer clic simple.
     * @given Zoom actual en el máximo permitido y zoomIn en true.
     * @expects No cambia el zoom si excede el límite máximo.
     */
    it('debería respetar el límite máximo de zoom en clic simple', () => {
      service.setZoomLimit(5, 10, false);
      mockView.setZoom(10);
      const initialZoom = mockView.getZoom()!;
      service.startZoomBox(true);
      const viewport = mockMap.getViewport();

      const pointerDownEvent = new PointerEvent('pointerdown');
      viewport.dispatchEvent(pointerDownEvent);

      const pointerUpEvent = new PointerEvent('pointerup');
      viewport.dispatchEvent(pointerUpEvent);

      expect(mockView.getZoom()).toBe(initialZoom); // No cambia porque está en el máximo
    });
  });

  describe('stopZoomBox', () => {
    /**
     * @description Verifica que stopZoomBox limpia interacciones, listeners y capas.
     * @given ZoomBox activo con interacción y capa.
     * @expects Elimina DragBox, listeners, capa y restaura el cursor.
     */
    it('debería detener ZoomBox y limpiar recursos', () => {
      service.startZoomBox(true);
      const viewport = mockMap.getViewport();
      spyOn(mockMap, 'removeInteraction');
      spyOn(mockMap, 'removeLayer');

      service.stopZoomBox();

      expect(mockMap.removeInteraction).toHaveBeenCalled();
      expect(mockMap.removeLayer).toHaveBeenCalled();
      expect(viewport.style.cursor).toBe('default');
      expect(viewport.onpointerdown).toBeNull();
      expect(viewport.onpointerup).toBeNull();
    });
  });

  describe('removeInteractions', () => {
    /**
     * @description Verifica que removeInteractions elimina solo interacciones DragBox.
     * @given Múltiples interacciones en el mapa.
     * @expects Elimina solo las interacciones de tipo DragBox.
     */
    it('debería eliminar interacciones DragBox', () => {
      const dragBox = new DragBox();
      mockMap.addInteraction(dragBox);
      spyOn(mockMap, 'removeInteraction');

      service.removeInteractions();

      expect(mockMap.removeInteraction).toHaveBeenCalledWith(dragBox);
    });
  });

  describe('setZoomLimit', () => {
    /**
     * @description Verifica que setZoomLimit establece los límites de zoom y actualiza el estado.
     * @given Nuevos límites de zoom y paneo habilitado.
     * @expects Actualiza los límites y configura el cursor a 'grab'.
     */
    it('debería establecer límites de zoom y habilitar paneo', async () => {
      service.setZoomLimit(5, 15, true);
      expect(mockMap.getViewport().style.cursor).toBe('grab');
      expect(await firstValueFrom(service.isMinZoom$)).toBeFalse();
      expect(await firstValueFrom(service.isMaxZoom$)).toBeFalse();
    });
  });

  describe('ngOnDestroy', () => {
    /**
     * @description Verifica que ngOnDestroy limpia todos los recursos.
     * @given Servicio inicializado con interacciones y suscripciones.
     * @expects Llama a stopZoomBox, desuscribe eventos y completa subjects.
     */
    it('debería limpiar recursos al destruir el servicio', () => {
      spyOn(service, 'stopZoomBox');
      spyOn(mockView, 'un');
      const isDrawingSubject = (
        service as unknown as {
          isDrawingZoomBoxSubject: { complete: jasmine.Spy };
        }
      ).isDrawingZoomBoxSubject;
      const isMaxZoomSubject = (
        service as unknown as { isMaxZoomSubject: { complete: jasmine.Spy } }
      ).isMaxZoomSubject;
      const isMinZoomSubject = (
        service as unknown as { isMinZoomSubject: { complete: jasmine.Spy } }
      ).isMinZoomSubject;
      spyOn(isDrawingSubject, 'complete');
      spyOn(isMaxZoomSubject, 'complete');
      spyOn(isMinZoomSubject, 'complete');

      service.ngOnDestroy();

      expect(service.stopZoomBox).toHaveBeenCalled();
      expect(mockView.un).toHaveBeenCalledWith(
        'change:resolution',
        jasmine.any(Function)
      );
      expect(isDrawingSubject.complete).toHaveBeenCalled();
      expect(isMaxZoomSubject.complete).toHaveBeenCalled();
      expect(isMinZoomSubject.complete).toHaveBeenCalled();
    });
  });
});
