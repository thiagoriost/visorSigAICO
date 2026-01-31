// map-base.interface.ts
import VectorTileLayer from 'ol/layer/VectorTile';
import TileLayer from 'ol/layer/Tile';
import { MapasBase } from '@app/core//interfaces/enums/MapasBase.enum';
export interface MapaBaseInterface {
  name: MapasBase;
  title: string;
  layer: VectorTileLayer | TileLayer;
}
