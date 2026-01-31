import { Comunidades } from '../auth/Comunidad';
import { Directus_Roles } from './DirectusRoles';

/**
 * Interface para la coleccion de usuarios del sistema
 * @date 2025-12-05
 * @author Andres Fabian Simbaqueba
 */
export interface Directus_Users {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  avatar: null | string;
  location: null | string;
  title: null | string;
  description: null | string;
  tags: null | string;
  language: null | string;
  theme?: string;
  tfa_Secret: null | string;
  email_notifications: boolean;
  status: string;
  role: string | Directus_Roles;
  token: null | string;
  last_page: string;
  last_access?: string;
  provider: string;
  external_identifier: null | string;
  auth_data: null | string;
  Id_rol_visor: string | Directus_Roles;
  Id_Comunidad: Comunidades | string;
}
