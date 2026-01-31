import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { MapState } from '@app/core/interfaces/store/map.model';
import { selectProxyURL } from '@app/core/store/map/map.selectors';

/**
 * Servicio de descarga y formateo de **imágenes de leyenda WMS**.
 * --------------------------------------------------------------
 * Se encarga de obtener la imagen de `GetLegendGraphic` para una capa WMS y
 * devolverla en formato **DataURL (PNG base64)**, lista para incrustar en PDFs
 * u otros componentes.
 *
 * Características:
 * - Lee el **prefijo de proxy** desde el Store (NgRx) para evitar problemas de CORS.
 * - Permite **forzar el proxy** manualmente (útil en tests o entornos controlados).
 * - Convierte el `Blob` descargado a DataURL de manera segura.
 * - Limpia suscripciones al destruirse (OnDestroy).
 *
 *
 * @author
 *  Sergio Alonso Mariño Duque
 * @date
 *  02-09-2025
 * @version
 *  2.0.0
 */
@Injectable({ providedIn: 'root' })
export class LegendImageService implements OnDestroy {
  /** Notificador de ciclo de vida para cortar suscripciones del Store. */
  private destroy$ = new Subject<void>();

  /** Prefijo de proxy para evitar CORS (viene del Store). */
  private proxyUrl = '';

  constructor(private store: Store<MapState>) {
    // Mantén sincronizado el prefijo de proxy con el estado global (NgRx).
    this.store
      .select(selectProxyURL)
      .pipe(takeUntil(this.destroy$))
      .subscribe(url => {
        if (url) this.proxyUrl = url;
      });
  }

  /**
   * setProxy()
   * ----------
   * Forza un prefijo de proxy manualmente.
   * Útil en **tests** o para entornos donde no hay Store disponible.
   *
   * @param url Prefijo de proxy (p.ej. `/proxy?url=`). Si viene falsy, se limpia.
   */
  setProxy(url: string) {
    this.proxyUrl = url || '';
  }

  /**
   * loadLegendAsDataURL()
   * ---------------------
   * Descarga la imagen de leyenda WMS (endpoint `GetLegendGraphic`) y la
   * devuelve como **DataURL** en formato PNG.
   *
   * Flujo:
   * 1) Valida que `legendUrl` no venga vacía.
   * 2) Compone la URL final con el prefijo de **proxy** + `encodeURIComponent(legendUrl)`.
   * 3) Realiza `fetch` y valida que `res.ok === true`.
   * 4) Convierte el `Blob` a **DataURL** mediante `FileReader`.
   *
   * @param legendUrl URL original del `GetLegendGraphic` (sin proxificar).
   * @returns Promise<string> con el DataURL (base64) de la imagen.
   * @throws Error si la URL es vacía o si la respuesta HTTP no es OK.
   */
  async loadLegendAsDataURL(legendUrl: string): Promise<string> {
    if (!legendUrl) throw new Error('URL de leyenda vacía.');

    // Importante: encodeURIComponent para no romper querystrings originales al pasar por el proxy
    const proxiedUrl = this.proxyUrl + encodeURIComponent(legendUrl);

    const res = await fetch(proxiedUrl);
    if (!res.ok) {
      throw new Error(
        `Error al obtener leyenda: ${res.status} ${res.statusText}`
      );
    }

    const blob = await res.blob();
    return this.convertBlobToDataURL(blob);
  }

  /**
   * convertBlobToDataURL()
   * ----------------------
   * Convierte un `Blob` (imagen) en una cadena `DataURL` (base64).
   *
   * @param blob Imagen en formato `Blob`.
   * @returns Promise<string> con la cadena DataURL.
   * @throws Error si falla la lectura/convertido del `Blob`.
   */
  private convertBlobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        reader.result
          ? resolve(String(reader.result))
          : reject('Error al convertir blob a DataURL');
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * ngOnDestroy()
   * -------------
   * Libera suscripciones activas al Store.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
