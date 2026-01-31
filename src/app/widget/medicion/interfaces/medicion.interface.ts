/**
 * Interface que representa una medición.
 *
 * Esta interfaz define los detalles básicos de una medición, incluyendo su nombre
 * y la unidad de medida asociada. Por ejemplo, podría utilizarse para representar
 * mediciones de peso, longitud, temperatura, etc.
 *
 * @interface
 * @author Carlos Alberto Aristizabal Vargas
 *
 * @example
 * const medicion: Medicion = {
 *   name: "Peso",
 *   code: "kg"
 * };
 */
export interface Medicion {
  /**
   * Nombre de la medición.
   * Ejemplo: "Peso", "Altura", "Temperatura", etc.
   *
   * @type {string}
   */
  name: string;

  /**
   * Unidad de la medición.
   * Ejemplo: "kg", "m", "cm", "°C", etc.
   *
   * @type {string}
   */
  code: string;
}
