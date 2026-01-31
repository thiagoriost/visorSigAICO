/**
 * @description Interfaz que define la estructura de los pares clave-valor
 * @author Andres Fabian Simbaqueba del Rio <<anfasideri@hotmail.com>>
 * @date 27/12/2024
 * @interface ResultPairs
 */
export interface ResultPairs {
  key: string; // clave
  value: string; //valor
  type: 'image' | 'href' | 'number' | 'text' | 'innerHTML' | 'url'; //tipo de valor
}
