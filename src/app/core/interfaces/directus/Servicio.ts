import { Capa } from '@app/core/interfaces/directus/Capa';
import { Metadato } from '@app/core/interfaces/directus/Metadato';
import { Tipo_Servicio } from '@app/core/interfaces/directus/TipoServicio';

/**
 * Interface para la coleccion de servicio asociada a la capa
 * @date 2025-12-05
 * @author Andres Fabian Simbaqueba
 */
export interface Servicio {
  IdServicio?: number;
  Url: string;
  Descripcion: string;
  IdTipoServicio: number | Tipo_Servicio;
  Estado: string;
  IdMetadato: number | Metadato;
  idserviciowfs: number | Servicio;
  IdCapa: string | Capa;
}
