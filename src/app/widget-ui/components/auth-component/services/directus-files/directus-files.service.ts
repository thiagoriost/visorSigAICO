import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

/**
 * Servicio para consultar archivos en directus
 * @date 2025-11-14
 * @author Andres Fabian Simbaqueba
 * @export
 * @class DirectusFilesService
 * @typedef {DirectusFilesService}
 */
@Injectable({
  providedIn: 'root',
})
export class DirectusFilesService {
  /**
   * Obtiene la URL de un archivo
   * @param idFile id del archivo
   * @returns
   */
  getURLFile(idFile: string) {
    return environment.auth.url + '/assets/' + idFile;
  }
}
