import { Directus_Roles } from './DirectusRoles';
import { Tematica } from './Tematica';

/**
 * Interface para la coleccion de tematicas asociada a los roles
 * @date 2025-12-05
 * @author Andres Fabian Simbaqueba
 */
export interface Rol_Tematica {
  id?: number;
  Id_Rol: string | Directus_Roles;
  IdTematica: number | Tematica;
  Visible: string;
}
