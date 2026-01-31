import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { MapLegendService } from '@app/core/services/map-legend-service/map-legend.service';
import { LegendImageService } from './legend-image.service';

/**
 * Elemento de leyenda listo para incrustar en PDF:
 * - `layerName`: nombre legible de la capa
 * - `dataUrl`: imagen PNG codificada como DataURL (base64)
 */
export interface LegendItem {
  layerName: string;
  dataUrl: string;
}

/**
 * Servicio fachada para obtención de **leyendas** listas para exportar.
 * --------------------------------------------------------------------
 * Orquesta dos responsabilidades:
 * - Pregunta a `MapLegendService` qué capas visibles tienen leyenda y sus URLs.
 * - Usa `LegendImageService` para **descargar y convertir** cada leyenda a DataURL PNG.
 *
 * Ventajas:
 * - API simple de alto nivel para el orquestador de PDF: `getLegendsFromVisibleLayers()`.
 * - Manejo de errores **por capa** (si una leyenda falla, se omite sin romper todo).
 * - Mantiene el orden reportado por `MapLegendService` (útil para la salida).
 *
 * Notas:
 * - Se utiliza `firstValueFrom` para tomar un **snapshot** del estado actual
 *   de leyendas; no deja suscripciones abiertas.
 *
 * @author
 *  Sergio Alonso Mariño Duque
 * @date
 *  02-09-2025
 * @version
 *  2.0.0
 */
@Injectable({ providedIn: 'root' })
export class LegendFacadeService {
  constructor(
    private mapLegend: MapLegendService,
    private legendImage: LegendImageService
  ) {}

  /**
   * getLegendsFromVisibleLayers()
   * ------------------------------
   * Devuelve todas las **leyendas** de las capas visibles como una lista de `{layerName, dataUrl}`.
   *
   * Flujo:
   * 1) Consulta a `MapLegendService.obtenerCapasConLeyendas()` y toma el primer valor.
   * 2) Filtra solo las capas que poseen `leyendaUrl`.
   * 3) Para cada capa, descarga la imagen de leyenda y la convierte a **DataURL** PNG.
   * 4) Si alguna descarga/conversión falla, se registra un **warning** y se omite esa capa.
   * 5) Retorna únicamente las leyendas resueltas correctamente, preservando el orden original.
   *
   * Consideraciones:
   * - El nombre de la capa se toma de `layerDefinition?.titulo`; si no existe, se
   *   usa el fallback `"Capa sin nombre"`.
   * - El uso de `Promise.allSettled` permite continuar incluso cuando alguna
   *   leyenda falla individualmente.
   *
   * @returns Promise<LegendItem[]> Lista de leyendas convertidas a DataURL.
   */
  async getLegendsFromVisibleLayers(): Promise<LegendItem[]> {
    // 1) Foto del estado actual de leyendas visibles
    const { capas } = await firstValueFrom(
      this.mapLegend.obtenerCapasConLeyendas()
    );

    // 2) Para cada capa con URL de leyenda, dispara el trabajo de descarga/conversión
    const jobs = capas
      .filter(c => !!c.leyendaUrl)
      .map(async c => {
        const layerName = c.layerDefinition?.titulo || 'Capa sin nombre';
        try {
          const dataUrl = await this.legendImage.loadLegendAsDataURL(
            c.leyendaUrl!
          );
          return { layerName, dataUrl } as LegendItem;
        } catch (e) {
          // Falla controlada: se omite la capa problemática y se continúa
          console.warn(`[LEYENDA] Falló "${layerName}":`, e);
          return null;
        }
      });

    // 3) Espera no bloqueante: conserva éxitos y descarta fallas
    const settled = await Promise.allSettled(jobs);

    // 4) Solo resultados fulfilled y no nulos, preservando el orden original
    return settled
      .filter(s => s.status === 'fulfilled' && s.value)
      .map(
        s => (s as PromiseFulfilledResult<LegendItem | null>).value!
      ) as LegendItem[];
  }
}
