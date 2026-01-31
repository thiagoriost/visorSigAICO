import { Injectable } from '@angular/core';
import ImageLayer from 'ol/layer/Image';
import { ImageWMS } from 'ol/source';

/**
 * Servicio para gestionar el estado, posición y títulos de los widgets de la aplicación.
 *
 * Este servicio proporciona funcionalidades para:
 * - Inicializar configuraciones de widgets
 * - Controlar la visibilidad de widgets (mostrar/ocultar)
 * - Gestionar posiciones de widgets en la interfaz
 * - Obtener información de leyendas WMS de capas geográficas
 *
 * Los widgets son componentes de interfaz que pueden activarse o desactivarse
 * dinámicamente en la aplicación.
 *
 * @example
 * ```typescript
 * constructor(private widgetManager: WidgetManagerService) {}
 *
 * // Inicializar widgets
 * this.widgetManager.initializeWidgets([
 *   { name: 'mapa', position: { x: 10, y: 20 }, title: 'Mapa Principal' }
 * ]);
 *
 * // Alternar visibilidad
 * this.widgetManager.toggleWidget('mapa');
 * ```
 */
@Injectable({ providedIn: 'root' })
export class WidgetManagerService {
  /** Registro del estado de visibilidad de cada widget (true: visible, false: oculto) */
  private widgetStates: Record<string, boolean> = {};

  /** Registro de las posiciones (x, y) de cada widget en la interfaz */
  private widgetPositions: Record<string, { x: number; y: number }> = {};

  /** Registro de los títulos personalizados de cada widget */
  private widgetTitles: Record<string, string> = {};

  /**
   * Inicializa múltiples widgets con sus configuraciones iniciales.
   *
   * Este método establece el estado inicial de cada widget como no visible (false),
   * y registra su posición y título personalizado.
   *
   * @param configs - Array de configuraciones de widgets a inicializar.
   * @param configs[].name - Nombre identificador único del widget.
   * @param configs[].position - Posición inicial del widget en la interfaz.
   * @param configs[].position.x - Coordenada X (horizontal) en píxeles.
   * @param configs[].position.y - Coordenada Y (vertical) en píxeles.
   * @param configs[].title - Título descriptivo del widget. Si no se proporciona, usa el nombre.
   *
   * @example
   * ```typescript
   * this.initializeWidgets([
   *   { name: 'ayuda', position: { x: 100, y: 50 }, title: 'Ayuda' },
   *   { name: 'busqueda', position: { x: 200, y: 100 }, title: 'Búsqueda Avanzada' }
   * ]);
   * ```
   *
   * @returns {void}
   */
  initializeWidgets(
    configs: {
      name: string;
      position: { x: number; y: number };
      title: string;
    }[]
  ): void {
    configs.forEach(config => {
      this.widgetStates[config.name] = false;
      this.widgetPositions[config.name] = config.position;
      this.widgetTitles[config.name] = config.title || config.name;
    });
  }

  /**
   * Alterna el estado de visibilidad de un widget específico.
   *
   * Si el widget está visible lo oculta, y si está oculto lo muestra.
   * Solo afecta a widgets que han sido previamente inicializados.
   *
   * @param widgetName - Nombre identificador del widget a alternar.
   *
   * @example
   * ```typescript
   * // Si el widget está visible, se oculta; si está oculto, se muestra
   * this.toggleWidget('ayuda');
   * ```
   *
   * @returns {void}
   */

  toggleWidget(widgetName: string): void {
    if (Object.prototype.hasOwnProperty.call(this.widgetStates, widgetName)) {
      this.widgetStates[widgetName] = !this.widgetStates[widgetName];
    }
  }

  isWidgetVisible(widgetName: string): boolean {
    return this.widgetStates[widgetName] || false;
  }

  getWidgetPosition(widgetName: string): { x: number; y: number } {
    // //console.log('WidgetPosition => ', this.widgetPositions[widgetName]);
    return this.widgetPositions[widgetName] || { x: 100, y: 100 };
  }

  getWidgetTitle(widgetName: string): string {
    return this.widgetTitles[widgetName] || widgetName;
  }

  /**
   * Obtiene la URL de la imagen de la leyenda WMS para una capa específica.
   *
   * @param layer - Capa de tipo ImageLayer con fuente WMS.
   * @returns Cadena con la URL de la leyenda WMS.
   * @throws Error si no es posible obtener la URL.
   */
  public obtenerLeyendaDesdeCapa(layer: ImageLayer<ImageWMS>): string {
    if (!layer) {
      throw new Error('La capa proporcionada es nula o indefinida.');
    }

    const source = layer.getSource();
    if (!source) {
      throw new Error('La capa no tiene una fuente WMS válida.');
    }

    // Resolución arbitraria (puede ajustarse si se requiere)
    const resolution = 1;
    const legendUrl = source.getLegendUrl(resolution);

    if (!legendUrl) {
      throw new Error(
        'No se pudo obtener la URL de la leyenda desde la fuente WMS.'
      );
    }
    return legendUrl;
  }
}
