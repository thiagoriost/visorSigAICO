import { Injectable } from '@angular/core';
import { Comunidades } from '@app/core/interfaces/auth/Comunidad';
import { Tematica } from '@app/core/interfaces/directus/Tematica';
import {
  directus,
  publicDirectus,
} from '@app/widget-ui/components/auth-component/services/auth-http-service/directus';
import { ManyItems } from '@directus/sdk';

/**
 * Servicio encargado de consultar las tematicas asociadas a un rol
 * @date 2025-12-05
 * @author Andres Fabian Simbaqueba
 */
@Injectable()
export class ContentTableDirectusSearchService {
  /**
   * Consulta las tematicas asociadas a un rol
   *
   * @param idRol - rol del usuario
   * @param fields - lista de campos para incluir en la consulta
   * @param sort - lista de campos por los que se ordena la consulta
   * @param limit - cantidad de registros a devolver en la consulta
   * @param usePublicInstance - si es true, usa la instancia pública de Directus sin autenticación.
   *                            Útil para consultas anónimas o después del logout para evitar
   *                            intentos de refresh del token. Por defecto es false.
   * @returns promesa con los datos de la consulta o el mensaje de error
   */
  consultarTematicasAsociadasARol(
    idRol: string,
    fields?: string[],
    sort?: string[],
    limit?: number,
    usePublicInstance = false
  ): Promise<ManyItems<Tematica>> {
    // Selecciona la instancia apropiada de Directus según el contexto
    const directusInstance = usePublicInstance ? publicDirectus : directus;

    const tematica = directusInstance.items('Tematica');
    const promise: Promise<ManyItems<Tematica>> = tematica.readByQuery({
      filter: { Idrol: { _eq: idRol } },
      fields: fields ?? ['*.*'],
      sort: sort,
      limit: limit ?? -1,
    });
    return promise;
  }

  consultarComunidades(
    usePublicInstance = false
  ): Promise<ManyItems<Comunidades>> {
    const directusInstance = usePublicInstance ? publicDirectus : directus;
    const coleccion = directusInstance.items('Comunidades');

    return coleccion.readByQuery({
      fields: ['Nombre_Comunidad', 'Logo', 'Color_Primario'],
      sort: ['Nombre_Comunidad'],
    });
  }
}
