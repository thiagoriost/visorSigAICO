import { Injectable } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Feature, MapEvent } from 'ol';
import Polygon from 'ol/geom/Polygon';
import { Style, Fill, Stroke } from 'ol/style';
import { MapService } from '@app/core/services/map-service/map.service';
import { MapaBaseService } from '@app/shared/services/mapa-base/mapa-base.service';
import { MapasBase } from '@app/core/interfaces/enums/MapasBase.enum';

@Injectable({
  providedIn: 'root',
})
export class MiniMapService {
  /** Instancia del mini mapa */
  private miniMap: Map | null = null;
  /** Capa base actual del mini mapa */
  private miniMapLayer: TileLayer | undefined;
  /** Capa donde se dibuja el rectángulo del extent */
  private rectangleLayer: VectorLayer | null = null;
  /** Capa base seleccionada actualmente */
  private currentBaseMap: MapasBase = MapasBase.GOOGLE_SATELLITE;
  /** Indica si el paneo está habilitado */
  private isPanEnabled = false;

  /** Referencias a los manejadores de eventos del paneo */
  private pointerDownHandler?: (evt: PointerEvent) => void;
  private pointerMoveHandler?: (evt: PointerEvent) => void;
  private pointerUpHandler?: (evt: PointerEvent) => void;
  private cursorMoveHandler?: (evt: PointerEvent) => void;

  constructor(
    private mapService: MapService,
    private mapaBaseService: MapaBaseService
  ) {}

  /**
   * Crea un mini mapa vinculado a un mapa principal.
   * @param map Instancia del mapa principal.
   * @param targetElement Elemento HTML contenedor del mini mapa.
   */
  createMiniMap(map: Map, targetElement: HTMLElement): void {
    this.createMiniMapLayer(this.currentBaseMap);
    this.createMiniMapInstance(map, targetElement);

    // Escucha movimientos del mapa principal para actualizar el rectángulo
    map.on('moveend', (event: MapEvent) => this.callBackMoveendEvent(event));

    // Simula evento inicial para centrar el mini mapa y dibujar el rectángulo
    const view = map.getView();
    this.callBackMoveendEvent({
      frameState: {
        viewState: {
          center: view.getCenter(),
          resolution: view.getResolution(),
          zoom: view.getZoom(),
        },
        extent: view.calculateExtent(map.getSize()),
      },
    } as unknown as MapEvent);
  }

  /**
   * Habilita o deshabilita el paneo en el mini mapa.
   * Cuando está habilitado, se puede arrastrar el rectángulo y
   * se centra el mapa principal mediante animación.
   * @param enabled true para activar, false para desactivar.
   */
  setPanEnabled(enabled: boolean): void {
    this.isPanEnabled = enabled;
    if (!this.miniMap) return;

    // Re-inicializa o limpia la interacción según corresponda
    if (this.rectangleLayer) {
      this.initRectanglePanInteraction();
    }
  }

  /**
   * Cambia la capa base del mini mapa dinámicamente.
   * @param baseMap Nuevo mapa base a usar.
   */
  updateMiniMapLayer(baseMap: MapasBase): void {
    this.currentBaseMap = baseMap;

    if (!this.miniMap) return;

    const newLayer = this.mapaBaseService.getLayerByName(baseMap);
    if (newLayer) {
      if (this.miniMapLayer) {
        this.miniMap.removeLayer(this.miniMapLayer);
      }
      this.miniMapLayer = newLayer;
      this.miniMap.getLayers().insertAt(0, this.miniMapLayer);

      // Redibujar rectángulo del extent
      const mainMap = this.mapService.getMap();
      if (mainMap) {
        const view = mainMap.getView();
        const event = {
          frameState: {
            viewState: {
              center: view.getCenter(),
              resolution: view.getResolution(),
              zoom: view.getZoom(),
            },
            extent: view.calculateExtent(mainMap.getSize()),
          },
        } as unknown as MapEvent;
        this.callBackMoveendEvent(event);
      }
    }
  }

  /**
   * Elimina el mini mapa del DOM y libera memoria.
   */
  removeMiniMap(): void {
    if (!this.miniMap) return;
    this.miniMap.setTarget(undefined);
    this.miniMap = null;
    this.rectangleLayer = null;
  }

  /** Crea la capa base del mini mapa. */
  private createMiniMapLayer(baseMap: MapasBase): void {
    const layer = this.mapaBaseService.getLayerByName(baseMap);
    if (layer) this.miniMapLayer = layer;
  }

  /** Crea la instancia del mini mapa con su configuración inicial. */
  private createMiniMapInstance(map: Map, targetElement: HTMLElement): void {
    if (!targetElement) {
      console.error(
        'No se proporcionó un contenedor válido para el mini mapa.'
      );
      return;
    }

    const color =
      getComputedStyle(document.documentElement).getPropertyValue(
        '--primary-100'
      ) || '#d0e6ff';
    targetElement.style.border = `1px solid ${color.trim()}`;

    const mainView = map.getView();
    const mainCenter = mainView.getCenter();
    const mainResolution = mainView.getResolution();

    if (!mainCenter || mainResolution === undefined) {
      console.error(
        'El centro o resolución del mapa principal no está definido.'
      );
      return;
    }

    this.miniMap = new Map({
      target: targetElement,
      layers: [this.miniMapLayer!],
      view: new View({
        projection: map.getView().getProjection(),
        center: mainCenter,
        resolution: mainResolution,
        zoom: 2,
      }),
      interactions: [], // sin paneo global
      controls: [],
    });

    // Dibuja el rectángulo inicial
    const extent = map.getView().calculateExtent(map.getSize());
    const rectangleFeature = this.createRectangleFeature(extent);
    this.updateMiniMapLayerWithFeature(rectangleFeature);
  }

  /** Crea un rectángulo basado en un extent. */
  private createRectangleFeature(extent: number[]): Feature {
    const coordinates = [
      [
        [extent[0], extent[1]],
        [extent[2], extent[1]],
        [extent[2], extent[3]],
        [extent[0], extent[3]],
        [extent[0], extent[1]],
      ],
    ];

    const rectangleGeometry = new Polygon(coordinates);
    const rectangleFeature = new Feature(rectangleGeometry);

    const primaryColor = this.getPrimeNGPrimaryColor();
    rectangleFeature.setStyle(
      new Style({
        fill: new Fill({ color: `${primaryColor}20` }),
        stroke: new Stroke({ color: primaryColor, width: 2 }),
      })
    );

    return rectangleFeature;
  }

  /** Actualiza o crea la capa que contiene el rectángulo del extent. */
  private updateMiniMapLayerWithFeature(rectangleFeature: Feature): void {
    const vectorSource = new VectorSource({ features: [rectangleFeature] });

    if (this.rectangleLayer) {
      this.rectangleLayer.getSource()?.clear();
      this.rectangleLayer.getSource()?.addFeature(rectangleFeature);
    } else {
      this.rectangleLayer = new VectorLayer({ source: vectorSource });
      this.miniMap!.addLayer(this.rectangleLayer);
    }

    this.initRectanglePanInteraction();
  }

  /**
   * Permite arrastrar el rectángulo para panear el mapa principal.
   * Usa eventos nativos del viewport para evitar conflictos de tipo.
   */
  private initRectanglePanInteraction(): void {
    if (!this.miniMap || !this.rectangleLayer) return;

    const miniMap = this.miniMap;
    const viewport = miniMap.getViewport();
    const rectangleFeature = this.rectangleLayer.getSource()?.getFeatures()[0];
    if (!rectangleFeature) return;

    // Limpia cualquier listener previo
    if (this.pointerDownHandler)
      viewport.removeEventListener('pointerdown', this.pointerDownHandler);
    if (this.pointerMoveHandler)
      viewport.removeEventListener('pointermove', this.pointerMoveHandler);
    if (this.pointerUpHandler)
      viewport.removeEventListener('pointerup', this.pointerUpHandler);
    if (this.cursorMoveHandler)
      viewport.removeEventListener('pointermove', this.cursorMoveHandler);

    // Si el paneo no está habilitado, salir
    if (!this.isPanEnabled) return;

    const rectGeometry = rectangleFeature.getGeometry() as Polygon;
    let isDragging = false;
    let lastCoordinate: number[] | null = null;

    // --- Definición de handlers tipados ---
    this.cursorMoveHandler = (evt: PointerEvent) => {
      const pixel = miniMap.getEventPixel(evt);
      const feature = miniMap.forEachFeatureAtPixel(pixel, f => f);
      const element = miniMap.getTargetElement() as HTMLElement;
      if (feature === rectangleFeature) {
        element.style.cursor = isDragging ? 'grabbing' : 'grab';
      } else {
        element.style.cursor = '';
      }
    };

    this.pointerDownHandler = (evt: PointerEvent) => {
      const pixel = miniMap.getEventPixel(evt);
      const feature = miniMap.forEachFeatureAtPixel(pixel, f => f);
      if (feature === rectangleFeature) {
        isDragging = true;
        lastCoordinate = miniMap.getEventCoordinate(evt);
        (miniMap.getTargetElement() as HTMLElement).style.cursor = 'grabbing';
      }
    };

    this.pointerMoveHandler = (evt: PointerEvent) => {
      if (!isDragging || !lastCoordinate) return;
      const coordinate = miniMap.getEventCoordinate(evt);
      const deltaX = coordinate[0] - lastCoordinate[0];
      const deltaY = coordinate[1] - lastCoordinate[1];
      rectGeometry.translate(deltaX, deltaY);
      lastCoordinate = coordinate;
    };

    this.pointerUpHandler = () => {
      if (!isDragging) return;
      isDragging = false;
      (miniMap.getTargetElement() as HTMLElement).style.cursor = 'grab';

      const extent = rectGeometry.getExtent();
      const newCenter = [
        (extent[0] + extent[2]) / 2,
        (extent[1] + extent[3]) / 2,
      ];

      const mainMap = this.mapService.getMap();
      const mainView = mainMap?.getView();

      if (mainView && newCenter) {
        mainView.animate({
          center: newCenter,
          duration: 1000,
          easing: t => t * (2 - t),
        });
      }
    };

    // --- Registrar eventos ---
    viewport.addEventListener('pointermove', this.cursorMoveHandler);
    viewport.addEventListener('pointerdown', this.pointerDownHandler);
    viewport.addEventListener('pointermove', this.pointerMoveHandler);
    viewport.addEventListener('pointerup', this.pointerUpHandler);
  }

  /** Centra el mini mapa respecto al mapa principal. */
  private centrarMiniMapa(event: MapEvent): void {
    if (!this.miniMap) return;

    const centroMapaPrincipal = event.frameState?.viewState.center;
    if (!centroMapaPrincipal) return;

    const mainView = this.mapService?.getMap()?.getView();
    const miniMapView = this.miniMap.getView();

    const mainZoom = mainView?.getZoom();
    const animationOptions: {
      center: number[];
      duration: number;
      zoom?: number;
    } = {
      center: centroMapaPrincipal,
      duration: 250,
    };

    if (mainZoom !== undefined) {
      animationOptions.zoom = mainZoom - 4;
    }

    miniMapView.animate(animationOptions);
  }

  /** Retorna el color primario del tema PrimeNG. */
  private getPrimeNGPrimaryColor(): string {
    const rootStyles = getComputedStyle(document.documentElement);
    return rootStyles.getPropertyValue('--primary-color') || '#007bff';
  }

  /** Se ejecuta cuando el mapa principal se mueve. */
  private callBackMoveendEvent(event: MapEvent): void {
    this.addRectangleToMiniMap(event);
    this.centrarMiniMapa(event);
  }

  /** Dibuja el rectángulo del área visible del mapa principal. */
  private addRectangleToMiniMap(event: MapEvent): void {
    if (!this.miniMap) return;

    const extent = event.frameState?.extent;
    if (!extent) return;

    const rectangleFeature = this.createRectangleFeature(extent);
    this.updateMiniMapLayerWithFeature(rectangleFeature);
  }
}
