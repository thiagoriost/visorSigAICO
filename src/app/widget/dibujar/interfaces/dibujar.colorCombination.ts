/**
 * Interface que representa una combinación de colores para el dibujo.
 *
 * Esta interfaz define los detalles básicos de una combinación de colores, incluyendo
 * el color de relleno, el color del contorno, el grosor del contorno y la transparencia.
 * Podría utilizarse para gestionar las combinaciones de colores en herramientas de dibujo o diseño.
 *
 * @interface
 * @author Carlos Alberto Aristizabal Vargas
 *
 * @example
 * const colorCombination: ColorCombination = {
 *   fillColor: "#ff0000",
 *   strokeColor: "#0000ff",
 *   strokeWidth: 2,
 *   transparency: 80
 * };
 */
export interface ColorCombination {
  /**
   * Color de relleno en formato hexadecimal o nombre de color.
   * Ejemplo: "#ff0000", "#00ff00", "red", etc.
   *
   * @type {string}
   */
  fillColor: string;

  /**
   * Color del contorno en formato hexadecimal o nombre de color.
   * Ejemplo: "#ff0000", "#0000ff", "blue", etc.
   *
   * @type {string}
   */
  strokeColor: string;

  /**
   * Grosor del contorno en píxeles.
   * Ejemplo: 1, 2, 5, etc.
   *
   * @type {number}
   */
  strokeWidth: number;

  /**
   * Transparencia del relleno en porcentaje (0-100).
   * Ejemplo: 100 (opaco), 50 (transparente), etc.
   *
   * @type {number}
   */
  transparency: number;
}
