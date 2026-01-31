// Importaciones necesarias para que funcione la interfaz
import { Feature } from 'ol';
import { Style } from 'ol/style';

/**
 * Interface que representa una geometría junto con su estilo en el mapa.
 *
 * Esta interfaz combina una geometría de OpenLayers (Feature) con un estilo (Style),
 * lo que permite mantener juntos los datos de la geometría y sus características visuales
 * (como color, grosor, etc.).
 *
 * @interface
 * @author Carlos Alberto Aristizabal Vargas
 *
 * @example
 * const geometriaConEstilo: GeometriaEstilo = {
 *   geometry: new Feature(new Point([0, 0])),
 *   style: new Style({
 *     fill: new Fill({ color: 'rgba(255, 255, 255, 0.6)' }),
 *     stroke: new Stroke({ color: '#ffcc33', width: 2 })
 *   })
 * };
 */
export interface GeometriaEstilo {
  /**
   * Geometría representada por un objeto Feature de OpenLayers.
   * La geometría puede ser de cualquier tipo (Point, Polygon, LineString, etc.).
   *
   * @type {Feature}
   */
  geometry: Feature;

  /**
   * Estilo aplicado a la geometría, que define la apariencia visual de la geometría.
   * El estilo puede incluir propiedades como color, grosor de línea, transparencia, etc.
   *
   * @type {Style}
   */
  style: Style;

  /**
   * Medición de longitud asociada a la geometría.
   * Este valor representa la longitud total de la geometría (como una línea o perímetro de un polígono),
   * e incluye la unidad seleccionada por el usuario (por ejemplo: "123.45 km", "560.00 m").
   *
   * @type {string}
   */
  longitud?: string;

  /**
   * Medición de área asociada a la geometría.
   * Este valor representa el área calculada de la geometría (por ejemplo, un polígono),
   * e incluye la unidad seleccionada por el usuario (por ejemplo: "2.34 ha", "1500.00 m²").
   *
   * @type {string}
   */
  area?: string;
}
