import { Directus_Roles } from '@app/core/interfaces/directus/DirectusRoles';
import { Tematica_Capa } from '@app/core/interfaces/directus/TematicaCapa';

/**
 * Interface para la coleccion de tematicas
 * @date 2025-12-05
 * @author Andres Fabian Simbaqueba
 */
export interface Tematica {
  IdTematica?: number;
  Nombre: string;
  Orden: number;
  Descripcion: string;
  IdTematicaPadre: number | Tematica;
  Idrol: string | Directus_Roles; //directus_roles
  idTematicaCapa: Tematica_Capa[];
}
