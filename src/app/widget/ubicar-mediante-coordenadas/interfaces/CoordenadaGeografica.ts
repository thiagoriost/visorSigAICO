/**
 * Interface para la coordenada georgrafica
 * @date 23-04-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
export interface CoordenadaGeografica {
  id?: string;
  longitud: number;
  latitud: number;
  tipoGrado: 'decimal' | 'sexagecimal' | 'plana';
}
