/**
 * Representa una respuesta GeoJSON de tipo FeatureCollection, que contiene un conjunto de características (features) geoespaciales.
 *
 * Esta interfaz es comúnmente utilizada cuando se recibe una respuesta desde un servidor que entrega datos en formato GeoJSON,
 * donde cada característica (feature) tiene una geometría y propiedades asociadas.
 *
 * @interface GeoJsonResponse
 */
export interface GeoJsonResponse {
  /**
   * El tipo de la colección, siempre será 'FeatureCollection'.
   *
   * @type {'FeatureCollection'}
   */
  type: 'FeatureCollection';

  /**
   * Una lista de características (features), cada una con una geometría y propiedades.
   *
   * @type {Array<Feature>}
   */
  features: {
    /**
     * El tipo de cada característica, siempre será 'Feature'.
     *
     * @type {'Feature'}
     */
    type: 'Feature';

    /**
     * La geometría de la característica. Puede ser de varios tipos (punto, línea, polígono, etc.).
     * La geometría se define mediante el tipo y las coordenadas correspondientes.
     *
     * @type {Geometry}
     */
    geometry:
      | { type: 'Point'; coordinates: [number, number] }
      | { type: 'MultiPoint'; coordinates: [number, number][] }
      | { type: 'LineString'; coordinates: [number, number][] }
      | { type: 'MultiLineString'; coordinates: [number, number][][] }
      | { type: 'Polygon'; coordinates: [number, number][][] }
      | { type: 'MultiPolygon'; coordinates: [number, number][][][] }
      | { type: string; coordinates: unknown };

    /**
     * Propiedades asociadas a la característica. Puede contener cualquier clave/valor.
     * Generalmente, se utiliza para almacenar atributos de la geometría (por ejemplo, nombre, id, etc.).
     *
     * @type {Record<string, unknown>}
     */
    properties: Record<string, unknown>;
  }[];
}
