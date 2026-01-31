import { Injectable } from '@angular/core';
import { AuthUserInterface } from '@app/core/interfaces/auth/UserModel';
import { UserItem } from '@directus/sdk';
import { directus } from './directus';
import { AuthResult, ItemInput } from '@directus/sdk';
import { AuthDirectusSchema } from '@app/core/interfaces/auth/AuthStateInterface';

type DirectusUser = UserItem<AuthDirectusSchema['users']>;

// Definición de la interfaz para representar errores se eliminará cuando no se requiera mock
declare interface AuthError {
  errors: {
    message: string;
    extensions: {
      code: string;
    };
  }[];
}

/**
 * @description Servicio encargado de manejar las peticiones HTTP relacionadas con la autenticación en Directus.
 *
 * Gestiona procesos como:
 * - Inicio de sesión contra el backend.
 * - Renovación de tokens.
 * - Cierre de sesión.
 *
 * También expone un método `loginMock` para pruebas locales sin necesidad de conexión a backend.
 *
 * @author javier.munoz@igac.gov.co
 * @version 1.0.0
 * @since 02/09/2025
 * @class AuthService
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Refresca token actual si esta dentro del plazo de refresco
  tryAutologin(): Promise<false | AuthResult> {
    return directus.auth.refresh();
  }

  /**
   * Metodo para refrescar el token de acceso con el token de refresco
   * @returns
   */
  refreshToken(): Promise<false | AuthResult> {
    return directus.auth.refresh();
  }

  /**
   * Usa directus para obtener token de autenticación
   * @param email
   * @param password
   */
  async login(email: string, password: string): Promise<AuthResult> {
    const auth = await directus.auth.login({ email, password });

    // Validar rol
    await this.validateUserRole();

    return auth;
  }

  /**
   * Valida que el usuario tenga Rol Visor = S.
   * Si no tiene, hace logout y rechaza la promesa.
   */
  private async validateUserRole(): Promise<ItemInput<AuthUserInterface>> {
    const user = await this.loadUserData();

    if (typeof user.role === 'object' && user.role?.Rol_visor !== 'S') {
      await this.logout();
      return Promise.reject({
        message: 'Usuario no autorizado',
        code: 'NO_ROLE',
      });
    }
    return user;
  }

  /**
   * Usa directus para obtener datos del usuario autenticado
   */
  loadUserData(): Promise<AuthUserInterface> {
    return directus.users.me
      .read({ fields: ['*.*'] })
      .then((user): AuthUserInterface => {
        const u = user as unknown as DirectusUser;
        const mappedUser: AuthUserInterface = {
          id: u.id,
          first_name: u.first_name,
          last_name: u.last_name,
          email: user['email'] ?? '',
          status: u.status,
          role: u.role,
          provider: u.provider,
          last_page: user['last_page'] ?? '',
          // Campos personalizados que NO vienen en Directus y deben definirse por defecto
          Id_Comunidad: user['Id_Comunidad'] ?? '',
          Id_rol_visor: user['Id_rol_visor'] ?? '',
          // Campos extra que tu interfaz exige pero Directus no entrega
          theme_light_overrides: null,
          theme_dark_overrides: null,
          theme_light: null,
          appearance: null,
          email_notifications: true,
          token: null,
          avatar: user.avatar ?? null,
          tags: user['tags']?.toString() ?? '',
          language: user.language ?? null,
          description: user.description ?? null,
          title: user.title ?? null,
          location: user.location ?? null,
          password: '',
          tfa_secret: '',
          external_identifier: '',
          auth_data: '',
          theme_dark: '',
        };

        return mappedUser;
      });
  }

  /**
   * Usa directus para cerrar sesión
   */
  logout(): Promise<void> {
    return directus.auth.logout();
  }

  /**
   * Método que simula el inicio de sesión contra la API.
   * Dependiendo sí el email contiene 'igac', retornará:
   * - Una promesa resuelta con un objeto AuthResult (caso exitoso).
   * - Una promesa rechazada con un objeto AuthError (caso fallido).
   *
   * @param email Correo electrónico del usuario (no se usa en este mock).
   * @returns Promise<AuthResult> (o error simulado en caso de fallo).
   */
  loginMock(email: string): Promise<AuthResult> {
    const badResponse: boolean = email.indexOf('igac') > 0 ? true : false;
    const responseMock: AuthResult = {
      access_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFjNzE4MDQyLTEwNTUtNDdkOC1iODQzLTg1NGJiZWM4YzQzOCIsInJvbGUiOiI4MGNhOTdlYi1jNmUxLTRlYmUtOTg2OS0zODdjNmE1ODVkYTYiLCJhcHBfYWNjZXNzIjp0cnVlLCJhZG1pbl9hY2Nlc3MiOnRydWUsImlhdCI6MTc1NjQwMTQ2NywiZXhwIjoxNzU2NDAzMjY3LCJpc3MiOiJkaXJlY3R1cyJ9.6p7HFDblmkQCTeOVIy8hWP3ddyAQpkirpcMHAvtbye0',
      expires: 1800000,
      refresh_token:
        'ryheAhdbSjKgLVJ5F9tXXz7-QFK054z8DmPy0Lcw_rplDnyv9MPvrHyHkO3cj1Va',
    };

    const errorMock: AuthError = {
      errors: [
        {
          message: 'Invalid user credentials.',
          extensions: {
            code: 'INVALID_CREDENTIALS',
          },
        },
      ],
    };

    if (badResponse == false) {
      console.log('rechazada Sesión Mock');
      return Promise.reject(errorMock);
    } else {
      console.log('iniciada Sesión Mock');
      return Promise.resolve(responseMock);
    }
  }

  /**
   * Cierra la sesión Mock
   */
  logoutMock(): Promise<void> {
    return Promise.resolve(console.log('Cerrada Sesión Mock'));
  }

  /**
   * Usa directus para obtener datos del usuario autenticado
   */
  loadUserDataMock(): Promise<ItemInput<AuthUserInterface>> {
    const userMock: AuthUserInterface = {
      id: '1c718042-1055-47d8-b843-854bbec8c438',
      first_name: 'Administrador',
      last_name: 'DIP',
      email: 'admin.dip@igac.gov.co',
      password: '**********',
      location: null,
      title: null,
      description: null,
      tags: null,
      avatar: null,
      language: null,
      tfa_secret: null,
      status: 'active',
      role: '80ca97eb-c6e1-4ebe-9869-387c6a585da6',
      token: null,
      last_page: '/users',
      provider: 'default',
      external_identifier: null,
      auth_data: null,
      appearance: null,
      email_notifications: true,
      theme_light_overrides: null,
      theme_dark_overrides: null,
      theme_dark: null,
      theme_light: null,
      Id_Comunidad: '',
      Id_rol_visor: '',
    };

    return Promise.resolve(userMock);
  }
}
