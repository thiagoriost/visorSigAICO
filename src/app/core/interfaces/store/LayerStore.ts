import { CapaMapa } from '../AdminGeo/CapaMapa';
import { LayerLevel } from '../enums/LayerLevel.enum';

/**
 * @description Interface para almacenar las capas en el store
 * @author Andres Fabian Simbaqueba del rio <<anfasideri@hotmail.com>>
 * @date 06/12/2024
 * @interface LayerStore
 */
export interface LayerStore {
  layerDefinition: CapaMapa; //defincion de la capa
  layerLevel: LayerLevel; //nivel de capa en el que se creó la capa
  orderInMap: number; //orden en el mapa
  isVisible: boolean; //visibilidad de la capa
  transparencyLevel: number; // nivel de transparencia de la capa
}
