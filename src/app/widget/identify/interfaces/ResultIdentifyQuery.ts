import { FeatureResult } from './FeatureResult';

/**
 * @description Interface para el resultado de la consulta de identificación de WMS
 * @author Andres Fabian Simbaqueba del Rio <<anfasideri@hotmail.com>>
 * @date 27/12/2024
 * @interface ResultIdentifyWMSQuery
 */
export interface ResultIdentifyWMSQuery {
  type: string;
  totalFeatures: string;
  features: FeatureResult[];
  crs: object | null;
}
