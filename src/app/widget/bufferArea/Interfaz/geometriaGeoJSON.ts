/**
 * Representa una geometría GeoJSON que puede ser de tipo 'Point' o 'Polygon'.
 *
 * Esta interfaz describe un objeto que tiene un tipo de geometría y sus coordenadas.
 *
 * @interface GeometriaGeoJSON
 */
export interface GeometriaGeoJSON {
  /**
   * El tipo de la geometría. Puede ser 'Point' o 'Polygon'.
   *
   * @type {'Point' | 'Polygon'}
   */
  type: 'Point' | 'Polygon';

  /**
   * Las coordenadas de la geometría.
   * Para 'Point', es un arreglo con dos valores [x, y] representando las coordenadas de un punto.
   * Para 'Polygon', es un arreglo de coordenadas que define los vértices del polígono.
   *
   * @type {number[] | number[][][]}
   */
  coordinates: number[] | number[][][];
}
