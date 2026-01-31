import { Injectable } from '@angular/core';

/**
 * @description Servicio para cargar y acceder a la configuración de la aplicación desde un archivo JSON.
 * @author Juan Carlos Valderrama Gonzalez
 */
@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private config: Record<string, unknown> | undefined;

  /**
   * @description Carga el archivo de configuración `config.json` desde la carpeta `assets`.
   * Este método debe ser llamado antes de intentar acceder a cualquier configuración.
   * @returns {Promise<void>} Una promesa que se resuelve cuando la configuración ha sido cargada.
   */
  load(): Promise<void> {
    return fetch('./assets/config.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(
            `Error al cargar config.json: ${response.status} ${response.statusText}`
          );
        }
        return response.json();
      })
      .then(cfg => {
        this.config = cfg;
      })
      .catch((error: unknown) => {
        console.error(
          'FALLO AL CARGAR LA CONFIGURACIÓN: No se pudo cargar o procesar el archivo config.json. La aplicación podría no funcionar como se espera.',
          error
        );
        this.config = {}; // Se asigna un objeto vacío para evitar fallos en `get()`
      });
  }

  /**
   * @description Obtiene un valor de la configuración por su clave.
   * @template T El tipo esperado del valor de configuración.
   * @param {string} key La clave del valor de configuración a recuperar.
   * @returns {T} El valor de configuración asociado a la clave, o `undefined` si la clave no existe.
   */
  get<T>(key: string): T | undefined {
    return this.config ? (this.config[key] as T) : undefined;
  }
}
