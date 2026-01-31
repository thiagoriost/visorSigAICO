import { LayerEmitter } from '@app/widget/content-table-with-toggle-switch/interfaces/LayerEmitter';

/**
 * Interface para emitir datos cuando se manipula una capa
 * @date 11-09-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
export interface LayerEmitterVersionTwo extends LayerEmitter {
  transparency?: number; //nivel de transparencia
  isVisible?: boolean; //indica si es visible la capa en el mapa
}
