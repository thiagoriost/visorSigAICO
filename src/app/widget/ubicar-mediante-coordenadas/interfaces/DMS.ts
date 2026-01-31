/**
 * Interface para representar los datos sexagecimales de una coordenada
 * @date 10-07-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
export interface DMS {
  grados: number;
  minutos: number;
  segundos: number;
  direccion: 'N' | 'S' | 'E' | 'O';
}
