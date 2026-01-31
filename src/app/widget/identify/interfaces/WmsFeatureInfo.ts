/**
 * Interface para construir el feature con datos de tipo WMS
 * @date 07-07-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
export interface WMSFeatureInfo {
  xmlns: string;
  esri_wms: string;
  FIELDS?: object;
}
