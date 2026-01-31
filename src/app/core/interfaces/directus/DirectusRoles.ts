import { Directus_Users } from './DirectusUser';

/**
 * Interface para la coleccion de roles de acceso
 * @date 2025-12-05
 * @author Andres Fabian Simbaqueba
 */
export interface Directus_Roles {
  id?: string;
  name: string;
  icon: string;
  description: string;
  ip_access: string;
  enforce_tfa: boolean;
  admin_access: boolean;
  app_access: boolean;
  Rol_visor: 'Si' | 'No';
  users: Directus_Users[];
}
