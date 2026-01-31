/**
 * Interfaz que define una característica (feature) de un objeto GeoJSON.
 */
export interface GeoJSONGeometrias {
  type: string; // Tipo de la geometría
  properties?: Record<string, unknown>; // Diccionario de propiedades dinámicas asociadas al feature.
  attributes?: Record<string, unknown>; // Diccionario de propiedades dinámicas asociadas al feature.
  geometry: Geometria; // Objeto que representa la geometría del feature.
}

/**
 * Interfaz que define la estructura general de un objeto GeoJSON.
 */
export interface GeoJSONData {
  type: string;
  features: GeoJSONGeometrias[];
  spatialReference?: {
    wkid: number;
    latestWkid: number;
  };
  tipoServicio?: string; // 'WMS' | 'WFS' | 'REST' | 'Otro'
  geometryType?: string; // 'esriGeometryPoint' | 'esriGeometryPolyline' | 'esriGeometryPolygon' | 'Otro'
  url?: string; // URL del servicio de donde se obtuvo el GeoJSON (si aplica)
  nombreCapa?: string; // Nombre de la capa asociada (si aplica)
  titulo?: string; // Título descriptivo del conjunto de datos
  descripcion?: string; // Descripción del conjunto de datos
  fechaConsulta?: string; // Fecha y hora en que se obtuvo el GeoJSON
  atributosDisponibles?: string[]; // Lista de nombres de atributos disponibles en los features
}

/**
 * Interfaz que define la estructura de los datos utilizados en la tabla de atributos.
 */
export interface AttributeTableData {
  titulo: string;
  geojson: GeoJSONData;
  visible: boolean;
  rendertabla?: boolean; // Indica si se debe renderizar la tabla de atributos
  paginaActual?: number; // Página actual en la paginación de la tabla
  filasPorPagina?: number; // Número de filas por página en la tabla
  totalRegistros?: number; // Total de registros en la tabla
  atributosSeleccionados?: string[]; // Lista de atributos seleccionados para mostrar en la tabla
  ordenarPorAtributo?: string; // Atributo por el cual se ordena la tabla
  ordenarAscendente?: boolean; // Indica si el orden es ascendente (true) o descendente (false)
}

/**
 * Interfaz que define la geometría de un feature
 */
export interface Geometria {
  type: string;
  coordinates?: number[] | number[][] | number[][][];
  x?: number; // Coordenada X (longitud o este)
  y?: number; // Coordenada Y (latitud o norte)
  rings?: number[][][]; // Para polígonos
  paths?: number[][][]; // Para líneas
}
export interface RowWithGeometrias extends Record<string, unknown> {
  _geometry: Geometria; // Almacena la geometría original del feature
}
