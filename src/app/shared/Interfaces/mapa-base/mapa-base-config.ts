// map-base-config.interface.ts
import { MapasBase } from '@app/core/interfaces/enums/MapasBase.enum';

export interface MapaBaseConfig {
  name: MapasBase;
  url: string;
  attribution: string;
}
