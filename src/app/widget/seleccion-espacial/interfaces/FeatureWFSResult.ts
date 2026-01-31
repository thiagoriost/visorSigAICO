import { Geometria } from '@app/widget/attributeTable/interfaces/geojsonInterface';

/**
 * Interface para manejar los features de la consulta WFS en el
 * widget de seleccion espacial
 * @date 14-05-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
export interface FeatureWFSResult {
  type: string;
  id: string;
  geometry: Geometria;
  geometry_name: string;
  properties: Record<string, unknown>;
}
