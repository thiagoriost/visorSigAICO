import { Metadato } from '@app/core/interfaces/directus/Metadato';
import { Servicio } from '@app/core/interfaces/directus/Servicio';
import { Tematica_Capa } from '@app/core/interfaces/directus/TematicaCapa';

/**
 * Interface para la colección Capa
 * @date 2025-12-04
 * @author Andres Fabian Simbaqueba
 */
export interface Capa {
  IdCapa?: number;
  NombreCapa: string;
  Titulo: string;
  Atributo: string;
  IdMetadato: number | Metadato;
  IdServicio: number | Servicio;
  IdTematicaCapa: Tematica_Capa[];
}
