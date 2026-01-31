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
  isActivated?: boolean; //indica si la capa esta activada en el mapa
  transparencyValue?: number; //valor de transparencia de la capa
}
