/**
 * Interfaz que define una característica (feature) de un objeto GeoJSON.
 */
export interface GeoJSONGeometrias {
  type: string; // Tipo de la geometría
  properties: Record<string, unknown>; // Diccionario de propiedades dinámicas asociadas al feature.
  geometry: Geometria; // Objeto que representa la geometría del feature.
}

/**
 * Interfaz que define la estructura general de un objeto GeoJSON.
 */
export interface GeoJSONData {
  type: string;
  features: GeoJSONGeometrias[];
}

/**
 * Interfaz que define la estructura de los datos utilizados en la tabla de atributos.
 */
export interface AttributeTableData {
  titulo: string;
  geojson: GeoJSONData;
  visible: boolean;
}

/**
 * Interfaz que define la geometría de un feature
 */
export interface Geometria {
  type: string;
  coordinates: number[] | number[][] | number[][][];
}
export interface RowWithGeometrias extends Record<string, unknown> {
  _geometry: Geometria; // Almacena la geometría original del feature
}
