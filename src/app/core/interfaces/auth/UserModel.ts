import { Directus_Roles } from '../directus/DirectusRoles';
import { Comunidades } from './Comunidad';

export interface AuthTokenData {
  access_token: string;
  expires: number;
  refresh_token: string;
}

// Interface completa para la respuesta de autenticación
export interface AuthResponse {
  data: AuthTokenData;
}

// Interface para el rol del usuario autenticado
export interface AuthUserRole {
  id: string;
  name?: string;
  Rol_visor?: string;
  admin_access?: boolean;
  app_access?: boolean;
  icon?: string;
  description?: string;
}

// Interface completa para la respuesta del usuario autenticado
export interface AuthUserResponse {
  data: AuthUserInterface;
}

export interface AuthUserInterface {
  theme_light_overrides: null | string;
  theme_dark_overrides: null | string;
  id: string;
  first_name: string | null;
  last_name: string | null;
  password: string;
  location: null | string;
  title: null | string;
  description: null | string;
  tags: null | string;
  avatar: null | string;
  tfa_secret: null | string;
  status: string;
  role: AuthUserRole | string;
  token: null | string;
  last_page: string;
  theme_light: null | string;
  provider: string;
  external_identifier: null | string;
  email: string;
  auth_data: null | string;
  appearance: null | string;
  email_notifications: boolean;
  theme_dark: null | string;
  language: null | string;
  theme?: string;
  last_access?: string;
  Id_rol_visor: string | Directus_Roles;
  Id_Comunidad: Comunidades | string;
}
