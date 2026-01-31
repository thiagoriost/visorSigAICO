/**
 * @description Interface para los features de la geometria identificada
 * @author Andres Fabian Simbaqueba del Rio <<anfasideri@hotmail.com>>
 * @date 27/12/2024
 * @interface FeatureResult
 */
export interface FeatureResult {
  type: string;
  id: string;
  geometry: object | { type: string; coordinates: [[number, number]] };
  geometry_name: string;
  properties: object;
}
