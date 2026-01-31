import { Capa } from './Capa';
import { Directus_Roles } from './DirectusRoles';
import { Tematica } from './Tematica';

/**
 * Interface para la coleccion de capas asociadas a la tematica asociada al rol
 * @date 2025-12-05
 * @author Andres Fabian Simbaqueba
 */
export interface Rol_Tematica_Capa {
  id?: number;
  Id_Rol: string | Directus_Roles;
  IdTematica: number | Tematica;
  Id_Capa: number | Capa;
}
