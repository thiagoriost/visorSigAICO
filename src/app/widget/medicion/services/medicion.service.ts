import { Injectable, OnDestroy } from '@angular/core';
import { Draw, Modify, Snap } from 'ol/interaction';
import { Feature } from 'ol';
import { MapService } from '@app/core/services/map-service/map.service';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { LineString, Polygon } from 'ol/geom';
import { Subject, Subscription } from 'rxjs';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';

/**
 * Servicio encargado de gestionar las herramientas de medición sobre el mapa
 * utilizando OpenLayers. Permite dibujar geometrías (líneas, polígonos, puntos),
 * calcular longitudes y áreas, y emitir los resultados para su uso en componentes externos.
 *
 * También proporciona una interfaz para mostrar mensajes de ayuda dinámicos cerca del puntero.
 *
 * @author Carlos Alberto
 * @version 1.1.0
 * @since 2024-12-18
 */
@Injectable({
  providedIn: 'root',
})
export class MedicionService implements OnDestroy {
  private draw: Draw | null = null; // Interacción de dibujo activa
  private modify: Modify | null = null; // Interacción de modificación (no usada aún)
  private snap: Snap | null = null; // Interacción snap (no usada aún)
  private source: VectorSource; // Fuente de geometrías para la capa de dibujo
  private vectorLayer: VectorLayer; // Capa visual para geometrías de medición
  private longitudEnMetros = 0; // Longitud calculada (solo líneas)
  private areaEnMetrosCuadrados = 0; // Área calculada (solo polígonos)
  private banderaIntento = 0; // Control de intentos para inicializar la capa

  // Subjects para emitir longitud y área al exterior
  longitudSubject: Subject<number> = new Subject<number>();
  areaSubject: Subject<number> = new Subject<number>();

  private subscriptions: Subscription = new Subscription();

  // Referencias a los handlers del mensaje de ayuda flotante
  private mouseMoveHandler: ((event: MouseEvent) => void) | null = null;
  private mouseOutHandler: (() => void) | null = null;
  private mouseEnterHandler: (() => void) | null = null;

  /**
   * Constructor. Inicializa la fuente y capa vectorial de dibujo.
   * @param {MapService} mapService Servicio que proporciona acceso al mapa
   */
  constructor(private mapService: MapService) {
    this.source = new VectorSource();
    this.vectorLayer = new VectorLayer({
      source: this.source,
      style: { 'stroke-color': 'rgba(241, 40, 40, 0.86)', 'stroke-width': 2 },
    });

    this.inicializarCapaDibujo();
  }

  /**
   * Agrega la interacción de dibujo al mapa según el tipo de geometría,
   * muestra un mensaje de ayuda flotante, y emite resultados de medición.
   *
   * @param type Tipo de geometría a dibujar ('Point', 'LineString', 'Polygon')
   */
  addInteraction(type: 'Point' | 'LineString' | 'Polygon'): void {
    const map = this.mapService.getMap();
    if (!map) return;

    this.source.clear();

    if (this.draw) {
      map.removeInteraction(this.draw);
    }

    this.longitudEnMetros = 0;
    this.areaEnMetrosCuadrados = 0;
    this.longitudSubject.next(0);
    this.areaSubject.next(0);

    // Limpiar mensaje de ayuda anterior
    this.removePointerMessage();

    // Mostrar nuevo mensaje
    switch (type) {
      case 'Point':
        this.showMessageOnPointer(
          'Punto:,\nHaz clic una sola vez sobre el mapa para ubicar un punto.'
        );
        break;
      case 'LineString':
        this.showMessageOnPointer(
          'Línea con varios segmentos:,\n1. Haz clic en cada punto para trazar la línea.,\n2. Haz doble clic para finalizar la medición.'
        );
        break;
      case 'Polygon':
        this.showMessageOnPointer(
          'Polígono:,\n1. Haz clic para agregar cada vértice.,\n2. Haz doble clic para cerrar el polígono y calcular el área.'
        );
        break;
      default:
        this.showMessageOnPointer('Haz clic en el mapa para colocar un punto.');
    }

    this.draw = new Draw({
      source: this.source,
      type: type,
      stopClick: true,
    });

    map.addInteraction(this.draw);

    this.draw.on('drawend', event => {
      this.source.clear();
      const feature: Feature = event.feature;
      const geometry = feature.getGeometry();

      if (geometry instanceof LineString) {
        const transformedLine = geometry
          .clone()
          .transform('EPSG:4326', 'EPSG:3857');
        this.longitudEnMetros = transformedLine.getLength();
        this.longitudSubject.next(this.longitudEnMetros);
      }

      if (geometry instanceof Polygon) {
        const transformedPolygon = geometry
          .clone()
          .transform('EPSG:4326', 'EPSG:3857');
        this.areaEnMetrosCuadrados = transformedPolygon.getArea();
        this.areaSubject.next(this.areaEnMetrosCuadrados);
      }
    });
  }

  /**
   * Inicializa la capa de dibujo dentro del grupo de capas UPPER.
   * Realiza reintentos si el grupo aún no está disponible.
   */
  inicializarCapaDibujo(): void {
    this.banderaIntento++;
    const upperGroup = this.mapService.getLayerGroupByName(LayerLevel.UPPER);

    if (!upperGroup) {
      if (this.banderaIntento < 5) {
        setTimeout(() => this.inicializarCapaDibujo(), 1000);
      }
      return;
    }

    upperGroup.getLayers().push(this.vectorLayer);
  }

  /**
   * Elimina todas las interacciones de dibujo, modificación y snap activas del mapa.
   */
  removeInteractions(): void {
    const map = this.mapService.getMap();
    if (map) {
      if (this.draw) map.removeInteraction(this.draw);
      if (this.modify) map.removeInteraction(this.modify);
      if (this.snap) map.removeInteraction(this.snap);
    }

    this.draw = null;
    this.modify = null;
    this.snap = null;
  }

  /**
   * Elimina los mensajes flotantes de ayuda del puntero,
   * y limpia sus listeners del DOM para evitar fugas de memoria.
   */
  private removePointerMessage(): void {
    const map = this.mapService.getMap();
    const viewport = map?.getViewport();

    if (viewport) {
      if (this.mouseMoveHandler)
        viewport.removeEventListener('mousemove', this.mouseMoveHandler);
      if (this.mouseOutHandler)
        viewport.removeEventListener('mouseout', this.mouseOutHandler);
      if (this.mouseEnterHandler)
        viewport.removeEventListener('mouseenter', this.mouseEnterHandler);
    }

    const messageDiv = document.getElementById('mouse-pointer-message');
    if (messageDiv) {
      document.body.removeChild(messageDiv);
    }

    this.mouseMoveHandler = null;
    this.mouseOutHandler = null;
    this.mouseEnterHandler = null;
  }

  /**
   * Muestra un mensaje de ayuda flotante cerca del puntero del mouse
   * mientras se mueve sobre el mapa.
   *
   * @param message Texto a mostrar, separado por comas para crear múltiples líneas.
   */
  private showMessageOnPointer(message: string): void {
    // Limpia cualquier mensaje y handlers anteriores
    this.removePointerMessage();

    // Crear un nuevo div para el mensaje
    const messageDiv = document.createElement('div');
    messageDiv.id = 'mouse-pointer-message';
    messageDiv.style.position = 'absolute';
    messageDiv.style.pointerEvents = 'none';
    messageDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    messageDiv.style.padding = '5px';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.fontSize = '14px';
    messageDiv.style.color = 'black';
    messageDiv.style.whiteSpace = 'normal';
    messageDiv.style.transformOrigin = 'top left';
    messageDiv.style.wordWrap = 'break-word';
    document.body.appendChild(messageDiv);

    // Agregar líneas al mensaje
    messageDiv.innerHTML = '';
    message.split(',').forEach(line => {
      const lineElement = document.createElement('div');
      lineElement.textContent = line.trim();
      messageDiv.appendChild(lineElement);
    });

    // Agregar nuevos listeners al mapa
    const map = this.mapService.getMap();
    if (map) {
      const viewport = map.getViewport();

      this.mouseMoveHandler = (event: MouseEvent) => {
        const mapCoordinates = map.getEventCoordinate(event);
        const screenCoordinates = map.getPixelFromCoordinate(mapCoordinates);
        messageDiv.style.left = `${screenCoordinates[0] + 10}px`;
        messageDiv.style.top = `${screenCoordinates[1] + 10}px`;
      };

      this.mouseOutHandler = () => {
        messageDiv.style.display = 'none';
      };

      this.mouseEnterHandler = () => {
        messageDiv.style.display = 'block';
      };

      viewport.addEventListener('mousemove', this.mouseMoveHandler);
      viewport.addEventListener('mouseout', this.mouseOutHandler);
      viewport.addEventListener('mouseenter', this.mouseEnterHandler);
    }
  }

  /**
   * Elimina únicamente las interacciones de dibujo, modificación y snap,
   * sin afectar la capa ni los datos existentes.
   */
  removeDrawingInteraction(): void {
    const map = this.mapService.getMap();
    if (!map) {
      console.error('El mapa no está disponible');
      return;
    }

    if (this.draw) {
      map.removeInteraction(this.draw);
      this.draw = null;
    }

    if (this.modify) {
      map.removeInteraction(this.modify);
      this.modify = null;
    }

    if (this.snap) {
      map.removeInteraction(this.snap);
      this.snap = null;
    }
  }

  /**
   * Elimina todas las geometrías almacenadas en la capa de dibujo.
   */
  clearAllGeometries(): void {
    const source = this.vectorLayer?.getSource();
    if (source) {
      source.clear();
    }
  }

  /**
   * Método llamado automáticamente al destruir el servicio.
   * Libera interacciones, geometrías, listeners y observables.
   */
  ngOnDestroy(): void {
    this.removeInteractions();
    this.removePointerMessage();
    this.subscriptions.unsubscribe();
  }

  /**
   * Limpia los recursos temporales del servicio, como interacciones y mensajes del puntero.
   * Este método puede ser llamado desde el componente cuando sea necesario.
   */
  public limpiarMedicion(): void {
    this.removeInteractions();
    this.removePointerMessage();
    this.clearAllGeometries();
  }
}
