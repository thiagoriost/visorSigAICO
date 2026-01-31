import { Type } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetComponentConfig<T = unknown> {
  component: Type<T>;
  data: unknown[];
  title: string;
  position: WidgetPosition;
}

export interface BaseWidgetOption {
  renderOnMovil?: boolean;
  iconName: string;
  label: string;
  showWidget: boolean;
  icon?: string;
  funcionAejecutar?: (e: string) => void;
}

export interface SubOpcionesInterface extends BaseWidgetOption {
  widget?: WidgetComponentConfig;
}

export interface GeoFunction extends BaseWidgetOption {
  subOpciones?: SubOpcionesInterface[];
  widget?: WidgetComponentConfig;
}

export interface CurrentWidget {
  renderizado: boolean;
  name: string;
  position: WidgetPosition;
  size: { w: number; h: number };
  title: string;
  widget?: new (...args: unknown[]) => unknown; // Constructor signature
}

export interface TabConfig {
  title: string;
  component: Type<unknown>;
  inputs?: Record<string, unknown>;
}

/**
 * Interfaz que define la estructura general de un objeto GeoJSON.
 */
export interface GeoJSONData {
  type: string;
  features: GeoJSONGeometrias[];
}
/**
 * Interfaz que define la geometría de un feature
 */
export interface Geometria {
  type: string;
  coordinates: number[] | number[][] | number[][][];
}

/**
 * Interfaz que define una característica (feature) de un objeto GeoJSON.
 */
export interface GeoJSONGeometrias {
  type: string; // Tipo de la geometría
  properties: Record<string, unknown>; // Diccionario de propiedades dinámicas asociadas al feature.
  geometry: Geometria; // Objeto que representa la geometría del feature.
}

/**
 * @description Interface para las capas del visor geografico
 * @author Andres Fabian Simbaqueba del Rio <<anfasideri@hotmail.com>>
 * @date 27/11/2024
 * @interface CapaMapa
 */
export interface CapaMapa {
  id: string; //id de la capa, primary key
  titulo: string; //titulo de la capa
  leaf: boolean; //variable que indica que la capa es nodo hoja
  //atributos opcionales
  Result?: CapaMapa[];
  descripcionServicio?: string; //CNTI_Geoserver | Carto_ColMaps | PNN1 | DANE - Dependencia 60+ disperso.....
  urlMetadatoServicio?: string;
  tipoServicio?: 'WMS' | 'REST' | 'FILE'; //validar que opciones son wfs | wms
  wfs?: boolean;
  urlMetadato?: string;
  nombre?: string;
  descargaCapa?: boolean;
  url?: string;
  estadoServicio?: string;
  idInterno?: number;
  checked?: boolean;
  urlServicioWFS?: string;
  metadato?: string;
  origin?: 'external' | 'internal';
  tipo?: string;
  leyenda?: {
    nombre: string;
    color: string;
    icono: string;
  };
  [key: string]: unknown;
}

export enum LayerLevel {
  BASE = 'base',
  INTERMEDIATE = 'intermediate',
  UPPER = 'upper',
}

/**
 * @description Interface para almacenar las capas en el store
 * @author Andres Fabian Simbaqueba del rio <<anfasideri@hotmail.com>>
 * @date 06/12/2024
 * @interface LayerStore
 */
export interface LayerStore {
  layerDefinition: CapaMapa; //defincion de la capa
  layerLevel: LayerLevel; //nivel de capa en el que se creó la capa
  orderInMap: number; //orden en el mapa
  isVisible: boolean; //visibilidad de la capa
  transparencyLevel: number; // nivel de transparencia de la capa
  leyendaHTML?: SafeHtml;
  // leyendaBase64?: unknown[];
}
