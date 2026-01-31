// Update the import path below to the correct location of geojsonInterface.ts
import { GeoJSONData } from '../../attributeTable/interfaces/geojsonInterface';

export interface BufferRequestDTO {
  dissolve: boolean;
  distanceMeters: number;
  geometryGeoJson: GeoJSONData;
}
