import { Directus } from '@directus/sdk';
import { environment } from 'environments/environment';
import { AuthDirectusSchema } from '@app/core/interfaces/auth/AuthStateInterface';

/**
 * Instancia autenticada de Directus para peticiones que requieren autenticación.
 *
 * Esta instancia está configurada con:
 * - `mode: 'json'` - Autentica el token de refresco en el servidor de Directus a través de cookie
 * - `autoRefresh: true` - Actualiza automáticamente el token cuando está por expirar
 *
 * @remarks
 * Utilice esta instancia únicamente para operaciones que requieran un usuario autenticado.
 * Para peticiones públicas o anónimas, utilice {@link publicDirectus}.
 *
 * @see {@link publicDirectus} para peticiones sin autenticación
 */
export const directus = new Directus<AuthDirectusSchema>(environment.auth.url, {
  auth: {
    mode: 'json',
    autoRefresh: true,
  },
});

/**
 * Instancia pública de Directus para peticiones anónimas o sin autenticación.
 *
 * Esta instancia NO incluye configuración de autenticación, por lo que:
 * - No intentará refrescar tokens automáticamente
 * - No enviará headers de autenticación
 * - Es segura para usar después del logout
 *
 * @remarks
 * Utilice esta instancia para operaciones que no requieren autenticación,
 * especialmente cuando se consulta contenido público después de que un usuario
 * haya cerrado sesión. Esto previene intentos fallidos de refresh del token.
 *
 * @example
 * ```typescript
 * // Consultar tematicas públicas sin autenticación
 * const tematicas = publicDirectus.items('Tematica').readByQuery({
 *   filter: { Idrol: { _eq: publicRoleID } }
 * });
 * ```
 *
 * @see {@link directus} para peticiones autenticadas
 */
export const publicDirectus = new Directus<AuthDirectusSchema>(
  environment.auth.url,
  {
    auth: {
      mode: 'json',
      autoRefresh: false,
    },
  }
);
