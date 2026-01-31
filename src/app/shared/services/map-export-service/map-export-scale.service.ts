// @app/shared/services/map-export/map-export-scale.service.ts
import { Injectable } from '@angular/core';
import Map from 'ol/Map';

// Tabla de denominadores "bonitos" para la escala 1:N
const SCALE_DENOMINATORS: number[] = [
  1000, 2500, 5000, 10000, 25000, 50000, 100000, 200000, 500000, 1000000,
  2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000, 9000000,
  10000000,
];

export interface ScaleImageResult {
  scaleImage: string;
  SCwidth: number;
  SCheight: number;
}

/**
 * Servicio de utilidades de barras de escala: `MapExportScaleService`
 * ------------------------------------------------------------------
 * - Lee la barra de escala del DOM (si existe).
 * - Calcula barras de escala rápidas por resolución.
 * - Genera barras de tipo "ScaleBar" segmentadas.
 *
 * No depende de MapService ni de MapExportCoreService.
 */
@Injectable({ providedIn: 'root' })
export class MapExportScaleService {
  /**
   * getScaleLineImageData()
   * -----------------------
   * 1) Intenta leer la barra de escala real (.ol-scale-line-inner).
   * 2) Si no existe o es inválida, calcula una escala sintética rápida.
   */
  public async getScaleLineImageData(map: Map): Promise<ScaleImageResult> {
    try {
      const root: HTMLElement | Document =
        (map.getTargetElement?.() as HTMLElement) || document;

      const inner = await this.waitForElement(
        () => root.querySelector<HTMLElement>('.ol-scale-line-inner'),
        8,
        16
      );

      if (inner) {
        const label = (inner.textContent || '').trim();
        const width = inner.offsetWidth;

        if (label && width > 0 && label.length >= 2) {
          return this.drawScaleToCanvas(width, label);
        }
      }
    } catch (e) {
      console.warn(
        '[MapExportScale][SCALE] Falló lectura de .ol-scale-line-inner, usando cálculo rápido',
        e
      );
    }

    // Fallback robusto: cálculo rápido por resolución
    return this.getQuickScaleLineImageData(map);
  }

  /**
   * getQuickScaleLineImageData()
   * -----------------------------
   * Calcula una barra de escala basada en la resolución del mapa,
   * SIN añadir controles ni depender de rendercomplete.
   */
  public async getQuickScaleLineImageData(
    mapOriginal: Map
  ): Promise<ScaleImageResult> {
    try {
      const view = mapOriginal.getView();
      const proj = view.getProjection();
      const resolution = view.getResolution();

      if (!resolution || !proj) {
        // Caso muy raro: vista aún no lista → barra genérica
        return this.drawScaleToCanvas(100, '100 m');
      }

      const metersPerUnit = proj.getMetersPerUnit?.() ?? 1;
      const metersPerPx = resolution * metersPerUnit;

      const targetPx = 100; // ancho objetivo aproximado en pantalla
      const rawMeters = metersPerPx * targetPx;

      const niceMeters = this.toNiceDistance(rawMeters);
      const barWidthPx = niceMeters / metersPerPx;

      const label =
        niceMeters >= 1000
          ? `${(niceMeters / 1000).toLocaleString('es-ES')} km`
          : `${niceMeters.toLocaleString('es-ES')} m`;

      return this.drawScaleToCanvas(barWidthPx, label);
    } catch (e) {
      console.error(
        '[MapExportScale][SCALE] Error en getQuickScaleLineImageData',
        e
      );
      return this.drawScaleToCanvas(120, '100 m');
    }
  }

  /**
   * getScaleBarImageData()
   * ----------------------
   * Genera una barra de escala "tipo ScaleBar" segmentada.
   */
  public async getScaleBarImageData(
    mapOriginal: Map
  ): Promise<ScaleImageResult> {
    try {
      const view = mapOriginal.getView();
      const proj = view.getProjection();
      const resolution = view.getResolution();

      if (!resolution || !proj) {
        // Fallback básico: 1 km genérico
        return this.drawScaleBarToCanvas(100, 1000, 1);
      }

      const metersPerUnit = proj.getMetersPerUnit?.() ?? 1;
      const metersPerPx = resolution * metersPerUnit;

      const { totalMeters, barWidthPx } = this.pickNiceScaleBarLength(
        metersPerPx,
        80,
        180
      );

      const segments = 4;

      return this.drawScaleBarToCanvas(
        barWidthPx,
        totalMeters,
        metersPerPx,
        segments
      );
    } catch (e) {
      console.error(
        '[MapExportScale][SCALEBAR] Error en getScaleBarImageData',
        e
      );
      return this.drawScaleBarToCanvas(100, 1000, 1);
    }
  }

  // -------------------------------------------------------------------
  // Helpers privados
  // -------------------------------------------------------------------

  /** Polling sencillo a frames cortos hasta que haya un elemento válido (o agotar reintentos). */
  private async waitForElement<T extends HTMLElement>(
    fn: () => T | null,
    tries = 8,
    delayMs = 16
  ): Promise<T | null> {
    for (let i = 0; i < tries; i++) {
      const el = fn();
      if (el && el.offsetWidth > 0 && (el.textContent || '').trim()) {
        return el;
      }
      await this.sleep(delayMs);
    }
    return fn();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(res => setTimeout(res, ms));
  }

  private async drawScaleToCanvas(
    barWidthPx: number,
    scaleText: string
  ): Promise<ScaleImageResult> {
    try {
      const scaleFactor = 3;
      const paddingX = 10 * scaleFactor;
      const paddingY = 8 * scaleFactor;
      const fontSize = 14 * scaleFactor;
      const barHeight = 10 * scaleFactor;

      const height = paddingY + barHeight + paddingY + fontSize + paddingY;
      const width = Math.max(
        60 * scaleFactor,
        barWidthPx * scaleFactor + paddingX * 2
      );

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, width, height);

      // barra
      ctx.fillStyle = '#000';
      const barX = paddingX;
      const barY = paddingY;
      ctx.fillRect(barX, barY, barWidthPx * scaleFactor, barHeight);

      // texto
      ctx.fillStyle = '#000';
      ctx.font = `${fontSize}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(scaleText, width / 2, barY + barHeight + paddingY);

      return {
        scaleImage: canvas.toDataURL('image/png'),
        SCwidth: width,
        SCheight: height,
      };
    } catch (e) {
      console.error('[MapExportScale][SCALE] Error dibujando escala', e);
      return { scaleImage: 'data:,', SCwidth: 1, SCheight: 1 };
    }
  }

  private async drawScaleBarToCanvas(
    barWidthPxTotal: number,
    totalMeters: number,
    metersPerPx: number,
    segments = 4
  ): Promise<ScaleImageResult> {
    try {
      const scaleFactor = 3;
      const paddingX = 10 * scaleFactor;
      const paddingY = 8 * scaleFactor;

      const barHeight = 10 * scaleFactor;
      const tickHeight = 6 * scaleFactor;

      const barWidthCanvas = barWidthPxTotal * scaleFactor;

      const scaleFontSize = 12 * scaleFactor; // "1 : N"
      const labelFontSize = 9 * scaleFactor; // "0 / 100 km / 200 km"

      const height =
        paddingY +
        scaleFontSize +
        6 * scaleFactor +
        barHeight +
        10 * scaleFactor +
        labelFontSize +
        paddingY;

      const extraLabelMargin = 20 * scaleFactor;
      const width = Math.max(
        80 * scaleFactor,
        barWidthCanvas + paddingX * 2 + extraLabelMargin
      );

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, width, height);

      const barX = paddingX;
      const barY = paddingY + scaleFontSize + 6 * scaleFactor;

      // --- Texto de escala arriba (1 : N) ---
      const rawScaleDen = Math.round(metersPerPx / 0.00028);
      const snappedScaleDen = this.snapScaleDenominator(rawScaleDen);
      const scaleLabel = `1 : ${snappedScaleDen.toLocaleString('es-ES')}`;

      ctx.fillStyle = '#000';
      ctx.font = `${scaleFontSize}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(scaleLabel, width / 2, barY - 4 * scaleFactor);

      // --- Barra segmentada ---
      const segWidth = barWidthCanvas / segments;

      for (let i = 0; i < segments; i++) {
        const x = barX + i * segWidth;
        ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#555555';
        ctx.fillRect(x, barY, segWidth, barHeight);

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1 * scaleFactor;
        ctx.strokeRect(x, barY, segWidth, barHeight);
      }

      // Borde exterior
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1 * scaleFactor;
      ctx.strokeRect(barX, barY, barWidthCanvas, barHeight);

      // --- ticks y etiquetas ---
      ctx.beginPath();
      const midX = barX + barWidthCanvas / 2;
      const endX = barX + barWidthCanvas;

      ctx.moveTo(barX, barY);
      ctx.lineTo(barX, barY + barHeight + tickHeight);

      ctx.moveTo(midX, barY);
      ctx.lineTo(midX, barY + barHeight + tickHeight);

      ctx.moveTo(endX, barY);
      ctx.lineTo(endX, barY + barHeight + tickHeight);
      ctx.stroke();

      ctx.fillStyle = '#000';
      ctx.font = `${labelFontSize}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const halfMeters = totalMeters / 2;
      const fmt = (m: number) =>
        m >= 1000
          ? `${(m / 1000).toLocaleString('es-ES')} km`
          : `${m.toLocaleString('es-ES')} m`;

      const labelsY = barY + barHeight + tickHeight + 4 * scaleFactor;

      ctx.fillText('0', barX, labelsY);
      ctx.fillText(fmt(halfMeters), midX, labelsY);
      ctx.fillText(fmt(totalMeters), endX, labelsY);

      return {
        scaleImage: canvas.toDataURL('image/png'),
        SCwidth: width,
        SCheight: height,
      };
    } catch (e) {
      console.error(
        '[MapExportScale][SCALEBAR] Error dibujando escala segmentada',
        e
      );
      return { scaleImage: 'data:,', SCwidth: 1, SCheight: 1 };
    }
  }

  /**
   * Redondea una distancia cualquiera en metros a 1, 2 o 5 * 10^n
   * (típico patrón de barras de escala).
   */
  private toNiceDistance(rawMeters: number): number {
    if (rawMeters <= 0) return 1;

    const exp = Math.floor(Math.log10(rawMeters));
    const base = Math.pow(10, exp);
    const norm = rawMeters / base; // entre 1 y 10

    let niceNorm: number;
    if (norm < 2) niceNorm = 1;
    else if (norm < 5) niceNorm = 2;
    else niceNorm = 5;

    return niceNorm * base;
  }

  /**
   * Aproxima un denominador de escala 1:raw al valor más cercano de SCALE_DENOMINATORS.
   */
  public snapScaleDenominator(rawDen: number): number {
    if (!isFinite(rawDen) || rawDen <= 0) {
      return SCALE_DENOMINATORS[0];
    }

    let best = SCALE_DENOMINATORS[0];
    let bestDiff = Math.abs(rawDen - best);

    for (const value of SCALE_DENOMINATORS) {
      const diff = Math.abs(rawDen - value);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = value;
      }
    }

    return best;
  }

  /**
   * pickNiceScaleBarLength()
   * ------------------------
   * Dado `metersPerPx`, elige una longitud de barra "bonita"
   * (1, 2 o 5 * 10^n) cuyo ancho en píxeles caiga entre
   * `minPx` y `maxPx`, intentando quedar cerca de `targetPx`.
   */
  private pickNiceScaleBarLength(
    metersPerPx: number,
    minPx = 80,
    maxPx = 180
  ): { totalMeters: number; barWidthPx: number } {
    const targetPx = (minPx + maxPx) / 2;

    // Distancia aproximada que representarían targetPx píxeles
    const rawMeters = metersPerPx * targetPx;
    if (rawMeters <= 0) {
      return { totalMeters: 1, barWidthPx: 1 / metersPerPx };
    }

    const exp = Math.floor(Math.log10(rawMeters));
    const base = Math.pow(10, exp);

    // Generamos candidatos alrededor de ese orden de magnitud:
    const bases: number[] = [base / 10, base, base * 10];

    const normOptions = [1, 2, 5];

    const candidates: { meters: number; px: number; score: number }[] = [];

    for (const b of bases) {
      for (const n of normOptions) {
        const meters = n * b;
        if (meters <= 0) continue;
        const px = meters / metersPerPx;
        const score = Math.abs(px - targetPx); // qué tan cerca de target
        candidates.push({ meters, px, score });
      }
    }

    // Primero intentamos quedarnos dentro del rango [minPx, maxPx]
    const inRange = candidates.filter(c => c.px >= minPx && c.px <= maxPx);
    const best =
      inRange.sort((a, b) => a.score - b.score)[0] ||
      candidates.sort((a, b) => a.score - b.score)[0];

    return { totalMeters: best.meters, barWidthPx: best.px };
  }
}
