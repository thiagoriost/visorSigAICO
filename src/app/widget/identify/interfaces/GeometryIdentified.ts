import { ResultIdentifyWMSQuery } from './ResultIdentifyQuery';

/**
 * Interface que contiene el nombre de la capa y la geometría encontrada
 * @date 20-05-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
export interface GeometryIdentified {
  layerName: string; //nombre de la capa
  geometry: ResultIdentifyWMSQuery | null; //geometria identificada
}
