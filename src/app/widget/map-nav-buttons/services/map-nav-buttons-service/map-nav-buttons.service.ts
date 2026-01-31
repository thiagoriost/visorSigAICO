import { Injectable, OnDestroy } from '@angular/core';
import { MapService } from '@app/core/services/map-service/map.service';
//importar clases necesaria para dibujar un rectángulo
import { Feature, View, Map } from 'ol'; // Clase Feature de OpenLayers para trabajar con objetos geoespaciales
import { DragBox } from 'ol/interaction'; // Interacciones DragBox y MouseWheelZoom
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Polygon } from 'ol/geom';
import { Style, Stroke, Fill } from 'ol/style';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * @description Servicio encargardo de realizar las acciones de ZoomBox
 * @author javier.munoz@igac.gov.co
 * @version 1.2.0
 * @since 03/07/2025
 * @class MapNavButtonsService
 */
@Injectable({
  providedIn: 'root',
})
export class MapNavButtonsService implements OnDestroy {
  // Propiedades privadas para almacenar el estado de las interacciones
  private zoomBoxLayer: VectorLayer<VectorSource> | null = null; // Capa para el rectángulo
  private view: View | undefined; // Almacena la vista del mapa
  //Propiedades para detección de clics
  private clickTimer: ReturnType<typeof setTimeout> | null = null; //Almacena el temporizador para distinguir clic simple vs. sostenido.
  private isLongPress = false; // Bandera que indica si se detectó un clic sostenido.
  private readonly LONG_PRESS_DELAY = 30000; // Cantidad en milisegundos (300ms) para considerar un clic como "sostenido".
  // Propiedades para los límites de zoom
  private minZoom = 0; //zoom mínimo
  private maxZoom = 0; //zoom máximo
  // Subjects para Identificar si se está dibujando un zoomBox y límites de zoom
  private isDrawingZoomBoxSubject = new BehaviorSubject<boolean>(false); //Subject que identifica sí se está dibujando
  private isMaxZoomSubject = new BehaviorSubject<boolean>(false); // Subject que identifica sí se llegó al máximo nivel de zoom
  private isMinZoomSubject = new BehaviorSubject<boolean>(false); // Subject que identifica sí se llegó al mínimo nivel de zoom

  private currentZoomBox: DragBox | null = null; //iteración Dragbox
  private currentPointerDownHandler: ((event: PointerEvent) => void) | null =
    null; //punto en el cual el usuario precionó el clic derecho
  private currentPointerUpHandler: ((event: PointerEvent) => void) | null =
    null; //punto en el cual el usuario subio el clic derecho
  private currentKeyHandler: ((evt: KeyboardEvent) => void) | null = null; //Evento que se ejecuta cuando el usuario presiona una tecla

  // Observables públicos
  isDrawingZoomBox$ = this.isDrawingZoomBoxSubject.asObservable(); //Observador que indica sí se está dibujando
  isMaxZoom$: Observable<boolean> = this.isMaxZoomSubject.asObservable(); //Observador que indica sí se está en el nivel máximo de zoom
  isMinZoom$: Observable<boolean> = this.isMinZoomSubject.asObservable(); // Observador que indica sí se está en el nivel mínimo de zoom

  // Constructor que inyecta el servicio MapService y obtiene la vista del mapa
  constructor(private mapService: MapService) {
    const map = this.mapService.getMap();
    if (map) {
      this.validateMapConfig();
    } else {
      console.warn('El mapa no está disponible aún.');
    }
  }

  /**
   * Inicia la funcionalidad de Zoom Box.
   * @param {boolean} zoomIn - Dirección del zoom (in/out)
   * @param {string} [boxColor='red'] - Color del borde del rectángulo
   */
  startZoomBox(zoomIn: boolean, boxColor = 'red'): void {
    let isDragging = false;
    const map = this.mapService.getMap();
    this.validateMapConfig();

    if (!map || !this.view) {
      console.warn('El mapa o la vista no están disponibles.');
      return;
    }

    // Limpiar estado previo completamente
    this.stopZoomBox();
    this.removeInteractions();

    const viewport = map.getViewport();
    viewport.style.cursor = 'crosshair';
    this.isDrawingZoomBoxSubject.next(true);

    // Eliminar cualquier capa previa y crear una nueva
    this.cleanupZoomBoxLayer(map);
    this.zoomBoxLayer = this.createZoomBoxLayer(boxColor, zoomIn);
    map.addLayer(this.zoomBoxLayer);

    // Configurar interacción con nueva feature
    this.currentZoomBox = this.setupZoomBoxInteraction(map, this.view, zoomIn);
    map.addInteraction(this.currentZoomBox);

    // Configurar handlers de eventos
    const pointerDownHandler = (event: PointerEvent) => {
      event.preventDefault();
      isDragging = false;
      this.isLongPress = false;
      this.clickTimer = setTimeout(() => {
        this.isLongPress = true;
        isDragging = true;
      }, this.LONG_PRESS_DELAY);
    };

    const pointerUpHandler = (event: PointerEvent) => {
      event.preventDefault();
      if (this.clickTimer) {
        clearTimeout(this.clickTimer);
        this.clickTimer = null;
      }

      if (!this.isLongPress && !isDragging) {
        if (!map || !this.view) return;

        const coordinate = map.getEventCoordinate(event);
        const currentZoom = this.view.getZoom() || 0;
        const newZoom = zoomIn ? currentZoom + 1 : currentZoom - 1;

        // Verificar límites de zoom
        if (zoomIn && newZoom > this.maxZoom) return;
        if (!zoomIn && newZoom < this.minZoom) return;
        // Limpiar geometría antes del zoom por clic
        this.zoomBoxLayer?.getSource()?.clear();

        this.view.setCenter(coordinate);
        this.view.setZoom(newZoom);
      }
    };

    this.currentPointerDownHandler = pointerDownHandler;
    this.currentPointerUpHandler = pointerUpHandler;

    viewport.addEventListener('pointerdown', pointerDownHandler);
    viewport.addEventListener('pointerup', pointerUpHandler);

    // Configurar tecla Escape
    const keyHandler = (evt: KeyboardEvent) => {
      if (evt.key === 'Escape') this.stopZoomBox();
    };

    this.currentKeyHandler = keyHandler;
    document.addEventListener('keydown', keyHandler);
  }

  /**
   * Detiene completamente la funcionalidad de Zoom Box:
   * - Elimina interacciones
   * - Remueve listeners
   * - Limpia capas
   */
  stopZoomBox(): void {
    const map = this.mapService.getMap();
    if (!map) return;

    const viewport = map.getViewport();
    viewport.style.cursor = 'default';

    // Eliminar interacción actual
    if (this.currentZoomBox) {
      map.removeInteraction(this.currentZoomBox);
      this.currentZoomBox = null;
    }

    // Remover event listeners
    if (this.currentPointerDownHandler) {
      viewport.removeEventListener(
        'pointerdown',
        this.currentPointerDownHandler
      );
      this.currentPointerDownHandler = null;
    }

    if (this.currentPointerUpHandler) {
      viewport.removeEventListener('pointerup', this.currentPointerUpHandler);
      this.currentPointerUpHandler = null;
    }

    if (this.currentKeyHandler) {
      document.removeEventListener('keydown', this.currentKeyHandler);
      this.currentKeyHandler = null;
    }

    // Limpiar capa completamente
    this.cleanupZoomBoxLayer(map);
    this.isDrawingZoomBoxSubject.next(false);
  }

  /**
   * @memberof MapNavButtonsService
   * @description
   * Este método se encarga de eliminar las interacciones de dibujo, modificación y
   * ajuste que puedan estar activas en el mapa, limpiando el estado de la aplicación
   * para evitar interacciones no deseadas.
   */
  removeInteractions(): void {
    const map = this.mapService.getMap();
    if (!map) {
      console.warn('El mapa no está disponible.');
      return;
    }

    map.getInteractions().forEach(interaction => {
      if (interaction instanceof DragBox) {
        map.removeInteraction(interaction);
      }
    });
  }

  /**
   * Limpiar los recursos al destruir el servicio.
   *
   * @memberof MapNavButtonsService
   */
  ngOnDestroy(): void {
    this.stopZoomBox();
    if (this.view) {
      this.view.un('change:resolution', () => this.checkZoomLimits());
    }
    this.isDrawingZoomBoxSubject.complete();
    this.isMaxZoomSubject.complete();
    this.isMinZoomSubject.complete();
  }

  /**
   * Verifica los límites de zoom actuales y actualiza los subjects.
   *
   * @memberof MapNavButtonsService
   *
   * @description
   * Verifica los límites de zoom actuales y actualiza los subjects.
   */
  checkZoomLimits(): void {
    if (this.view) {
      const zoom = this.view.getZoom() || 0;
      this.isMaxZoomSubject.next(Math.floor(zoom) >= this.maxZoom);
      this.isMinZoomSubject.next(Math.floor(zoom) <= this.minZoom);
    } else {
      console.warn('La vista no está disponible aún.');
    }
  }

  /**
   * Define niveles de zoom para el mapa.
   * @param {number} minZoom - Nivel de zoom mínimo permitido.
   * @param {number} maxZoom - Nivel de zoom máximo permitido.
   * @memberof MapNavButtonsService
   *
   * @description
   * Asigna el nivel de zoom del mapa, permitiendo establecer límites
   */
  setZoomLimit(minZoom: number, maxZoom: number, isPanEnabled: boolean): void {
    this.minZoom = minZoom;
    this.maxZoom = maxZoom;
    if (isPanEnabled) {
      const map = this.mapService.getMap();
      if (map) {
        const viewport = map.getViewport();
        viewport.style.cursor = 'grab';
      } else {
        console.warn('El mapa no está disponible aún.');
      }
    }
    this.checkZoomLimits();
  }

  /**
   * Configura la interacción DragBox para el Zoom Box.
   * @param map - Instancia del mapa OpenLayers
   * @param view - Vista del mapa
   * @param zoomIn - Dirección del zoom
   * @returns Interacción DragBox configurada
   */
  private setupZoomBoxInteraction(
    map: Map,
    view: View,
    zoomIn: boolean
  ): DragBox {
    const source = this.zoomBoxLayer?.getSource();
    if (!source) {
      console.error('La fuente de la capa ZoomBox no está disponible');
      return new DragBox();
    }
    const zoomBox = new DragBox();
    const boxFeature = new Feature();

    zoomBox.on('boxstart', () => {
      source.clear(); // Limpiar cualquier geometría previa al iniciar
      source.addFeature(boxFeature);
    });

    zoomBox.on('boxdrag', () => {
      const extent = zoomBox.getGeometry().getExtent();
      if (extent.every(coord => isFinite(coord))) {
        const polygon = new Polygon([
          [
            [extent[0], extent[1]],
            [extent[0], extent[3]],
            [extent[2], extent[3]],
            [extent[2], extent[1]],
            [extent[0], extent[1]],
          ],
        ]);
        boxFeature.setGeometry(polygon);
      }
    });

    zoomBox.on('boxend', () => {
      const extent = zoomBox.getGeometry().getExtent();
      const mapSize = map.getSize();

      if (!mapSize || !view.getResolution()) return;
      const center = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];

      if (zoomIn) {
        view.fit(extent, {
          duration: 250,
          maxZoom: Math.min(this.maxZoom, view.getMaxZoom() || Infinity),
        });
      } else {
        const currentZoom = view.getZoom() || 0;
        const boxWidth = extent[2] - extent[0];
        const boxHeight = extent[3] - extent[1];
        const mapArea = mapSize[0] * mapSize[1];
        const boxArea = boxWidth * boxHeight;
        if (boxArea === 0) return;
        const areaRatio = mapArea / boxArea;
        const zoomFactor = Math.min(Math.sqrt(areaRatio), 4);
        const newZoom = Math.max(
          currentZoom - Math.log2(zoomFactor),
          this.minZoom
        );
        view.setZoom(newZoom);
      }

      view.setCenter(center);
      source.clear(); // Limpiar la geometría después de completar el zoom
      boxFeature.setGeometry(undefined); // Asegurar que la feature no mantenga geometría
    });

    return zoomBox;
  }

  /**
   * Limpia la capa del Zoom Box.
   * @param map - Instancia del mapa
   * @param keepLayer - Indica si mantener la capa (solo limpiar geometría)
   */
  private cleanupZoomBoxLayer(map: Map): void {
    if (!this.zoomBoxLayer) return;

    const source = this.zoomBoxLayer.getSource();
    if (source) {
      source.clear(); // Limpiar todas las geometrías
    }

    if (map && this.zoomBoxLayer) {
      map.removeLayer(this.zoomBoxLayer); // Eliminar la capa del mapa
    }

    this.zoomBoxLayer = null; // Resetear la referencia
  }

  /**
   * Se actualiza la vista y los límites del zoom, dado el caso en el que el la vista del mapa no esté cargada
   */
  private validateMapConfig(): void {
    if (!this.view) {
      const map = this.mapService.getMap();
      if (map) {
        this.view = map.getView();
        this.minZoom = this.view.getMinZoom();
        this.maxZoom = this.view.getMaxZoom();
        this.zoomBoxLayer = null;
        this.checkZoomLimits();
        this.view.on('change:resolution', () => this.checkZoomLimits());
      } else {
        console.error('El mapa no está disponible aún.');
      }
    }
  }

  /**
   * Crea la capa para visualizar el rectángulo del Zoom Box.
   * @param boxColor - Color del borde
   * @param zoomIn - Dirección del zoom
   * @returns Capa vectorial configurada
   */
  private createZoomBoxLayer(
    boxColor: string,
    zoomIn: boolean
  ): VectorLayer<VectorSource> {
    return new VectorLayer({
      source: new VectorSource(),
      style: this.getZoomBoxStyle(boxColor, zoomIn),
    });
  }

  /**
   * Genera el estilo para el rectángulo del Zoom Box.
   * @param boxColor - Color del borde
   * @param zoomIn - Dirección del zoom
   * @returns Estilo OpenLayers configurado
   */
  private getZoomBoxStyle(boxColor: string, zoomIn: boolean): Style {
    return new Style({
      stroke: new Stroke({
        color: boxColor,
        width: 2,
      }),
      fill: new Fill({
        color: zoomIn ? 'rgba(0, 0, 255, 0.1)' : 'rgba(255, 0, 0, 0.1)',
      }),
    });
  }
}
