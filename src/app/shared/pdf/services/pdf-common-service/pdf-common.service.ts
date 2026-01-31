import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { LegendEntry } from '../../../Interfaces/export-map/pdf-template';
import Map from 'ol/Map';
import proj4 from 'proj4';

// ====== Interface de escala (predefinidas del widget) ======
interface Escala {
  id: number;
  nombre: string; // ejemplo: "1:50.000"
  valor: number; // ejemplo: 50000
}

/**
 * Servicio de utilidades comunes para armado de PDFs: `PdfCommonService`
 * ---------------------------------------------------------------------
 * Reúne helpers reutilizables para:
 * - **Imágenes**: carga cross-origin y normalización a **DataURL PNG** (reescalado suave).
 * - **Leyendas**: paginado/centrado de imágenes de leyenda con encabezado opcional.
 * - **Descarga**: creación de `ObjectURL`, descarga con `<a>` temporal y revocación segura.
 * - **Escala**: cálculo del denominador `1:n` a partir de la resolución de la vista
 *   (alineado con la lógica del widget) y emparejado con escalas **predefinidas**.
 * - **Layout de texto**: utilidades para *wrap/truncado con elipsis* respetando un ancho
 *   (y opcionalmente, un alto máximo) — útil para evitar desbordes en footers/encabezados.
 *
 * Notas:
 * - `loadImageAsDataURL` usa `crossOrigin = 'anonymous'`. El servidor debe permitir CORS.
 * - Los métodos de descarga añaden y eliminan anclas temporales del DOM.
 * - Quien consuma `downloadPdfBlob`/`createPdfObjectUrl` es responsable de **revocar** el URL
 *   cuando ya no se necesite (o usar `downloadAndMaybeRevoke`).
 *
 * @author
 *  Sergio Alonso Mariño Duque
 * @date
 *  02-09-2025
 * @version
 *  2.0.0
 */
@Injectable({ providedIn: 'root' })
export class PdfCommonService {
  /**
   * Lista de escalas **predefinidas** (idéntica a la utilizada en el widget de UI).
   * Se usa para mapear el denominador calculado al label más cercano ("1:n").
   */
  private readonly ESCALAS_PREDEFINIDAS: Escala[] = [
    { id: 1, nombre: '1:1.000', valor: 1000 },
    { id: 2, nombre: '1:2.500', valor: 2500 },
    { id: 3, nombre: '1:5.000', valor: 5000 },
    { id: 4, nombre: '1:10.000', valor: 10000 },
    { id: 5, nombre: '1:25.000', valor: 25000 },
    { id: 6, nombre: '1:50.000', valor: 50000 },
    { id: 7, nombre: '1:100.000', valor: 100000 },
    { id: 8, nombre: '1:200.000', valor: 200000 },
    { id: 9, nombre: '1:500.000', valor: 500000 },
    { id: 10, nombre: '1:1.000.000', valor: 1000000 },
    { id: 11, nombre: '1:2.000.000', valor: 2000000 },
    { id: 12, nombre: '1:3.000.000', valor: 3000000 },
    { id: 13, nombre: '1:4.000.000', valor: 4000000 },
    { id: 14, nombre: '1:5.000.000', valor: 5000000 },
    { id: 15, nombre: '1:6.000.000', valor: 6000000 },
    { id: 16, nombre: '1:7.000.000', valor: 7000000 },
    { id: 17, nombre: '1:8.000.000', valor: 8000000 },
    { id: 18, nombre: '1:9.000.000', valor: 9000000 },
    { id: 19, nombre: '1:10.000.000', valor: 10000000 },
  ];

  // ==================================================
  // =============== Imágenes y Leyendas ==============
  // ==================================================

  /**
   * loadImageAsDataURL(url)
   * -----------------------
   * Carga una imagen desde `url` (CORS anónimo) y la convierte a **DataURL PNG**.
   * Si excede `400×400`, aplica **reescalado suave** manteniendo proporción.
   *
   * @param url URL pública de la imagen (CORS habilitado).
   * @returns   DataURL PNG lista para `jsPDF.addImage`.
   * @throws    Rechaza la promesa si no puede cargar o rasterizar.
   */
  async loadImageAsDataURL(url: string): Promise<string> {
    console.group('[PdfCommon] loadImageAsDataURL');
    console.debug('[PdfCommon] url', url);
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const maxW = 400,
              maxH = 400;
            let w = img.width,
              h = img.height;
            if (w > maxW || h > maxH) {
              const r = Math.min(maxW / w, maxH / h);
              w *= r;
              h *= r;
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              console.error('[PdfCommon] No canvas context');
              return reject('No canvas ctx');
            }
            ctx.drawImage(img, 0, 0, w, h);
            const data = canvas.toDataURL('image/png');
            console.log('[PdfCommon] imagen cargada OK', { w, h });
            resolve(data);
          } catch (e) {
            console.error('[PdfCommon] error rasterizando imagen:', e);
            reject(e);
          } finally {
            console.groupEnd();
          }
        };
        img.onerror = err => {
          console.error('[PdfCommon] error cargando imagen:', err);
          console.groupEnd();
          reject(err);
        };
        img.src = url;
      } catch (e) {
        console.error('[PdfCommon] excepción loadImageAsDataURL:', e);
        console.groupEnd();
        reject(e);
      }
    });
  }

  /**
   * getImageSize(dataUrl)
   * ---------------------
   * Obtiene las **dimensiones reales** (px) de una imagen a partir de su DataURL.
   *
   * @param dataUrl DataURL de la imagen.
   * @returns       `{ width, height }` en píxeles.
   */
  private getImageSize(
    dataUrl: string
  ): Promise<{ width: number; height: number }> {
    console.groupCollapsed('[PdfCommon] getImageSize');
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        img.onload = () => {
          console.debug('[PdfCommon] size', img.width, img.height);
          console.groupEnd();
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = err => {
          console.error('[PdfCommon] error leyendo tamaño imagen:', err);
          console.groupEnd();
          reject(err);
        };
        img.src = dataUrl;
      } catch (e) {
        console.error('[PdfCommon] excepción getImageSize:', e);
        console.groupEnd();
        reject(e);
      }
    });
  }

  /**
   * addLegendPages(doc, legends, opts?)
   * -----------------------------------
   * Agrega una o más **páginas de leyendas** al documento `jsPDF`.
   * Cada entrada se renderiza con:
   * - **Título** centrado (`layerName`) y
   * - **Imagen** escalada para respetar un alto máximo (~85% de la página).
   *
   * Si no cabe en la página actual, se cierra con `onAfterPage` (si existe),
   * se abre una nueva y se repite el proceso.
   *
   * @param doc    Instancia `jsPDF`.
   * @param legends Arreglo de leyendas `{ dataUrl, layerName }`.
   * @param opts   Opcional: `{ onAfterPage, drawFrame }` para footer personalizado y marco.
   */
  async addLegendPages(
    doc: jsPDF,
    legends: LegendEntry[],
    opts?: { onAfterPage?: (doc: jsPDF) => void; drawFrame?: boolean }
  ): Promise<void> {
    console.group('[PdfCommon] addLegendPages');
    console.time('[PdfCommon] addLegendPages');
    try {
      if (!legends?.length) {
        console.debug('[PdfCommon] sin leyendas, nada que agregar');
        return;
      }

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const margin = 10;
      const spacingY = 25;
      const titleFontSize = 16;
      const layerFontSize = 12;

      let currentY = margin + titleFontSize + 20;

      const drawFrameAndHeader = () => {
        if (opts?.drawFrame !== false) {
          doc.setDrawColor(0).setLineWidth(2);
          doc.rect(
            margin,
            margin,
            pageWidth - 2 * margin,
            pageHeight - 2 * margin
          );
        }
        doc.setFont('helvetica', 'bold').setFontSize(titleFontSize);
        doc.text('Leyenda', pageWidth / 2, margin + titleFontSize, {
          align: 'center',
        });
        doc.setFont('helvetica', 'normal');
      };

      // Primera página de leyendas
      doc.addPage();
      drawFrameAndHeader();

      const renderFooterIfAny = () => {
        try {
          opts?.onAfterPage?.(doc);
        } catch (e) {
          console.error('[PdfCommon] error en onAfterPage:', e);
        }
      };

      for (const lg of legends) {
        try {
          const { width, height } = await this.getImageSize(lg.dataUrl);
          const titleHeight = 10;
          const maxH = pageHeight * 0.85;
          const scale = height > maxH ? maxH / height : 1;
          const w = width * scale;
          const h = height * scale;
          const total = h + titleHeight + spacingY;

          // Si NO cabe, cerrar página actual (footer) y abrir otra
          if (currentY + total > pageHeight - margin) {
            renderFooterIfAny();
            doc.addPage();
            drawFrameAndHeader();
            currentY = margin + titleFontSize + 20;
          }

          // Título de la capa
          doc.setFontSize(layerFontSize);
          doc.text(lg.layerName || 'Leyenda', pageWidth / 2, currentY, {
            align: 'center',
          });
          currentY += titleHeight;

          // Imagen centrada
          const x = (pageWidth - w) / 2;
          doc.addImage(lg.dataUrl, 'PNG', x, currentY, w, h);
          currentY += h + spacingY;
        } catch (e) {
          console.error(
            '[PdfCommon] error renderizando leyenda:',
            lg?.layerName,
            e
          );
          // Continuar con la siguiente leyenda
        }
      }

      // Footer final de la última página de leyendas
      renderFooterIfAny();
      console.log('[PdfCommon] leyendas agregadas:', legends.length);
    } catch (e) {
      console.error('[PdfCommon] error general en addLegendPages:', e);
    } finally {
      console.timeEnd('[PdfCommon] addLegendPages');
      console.groupEnd();
    }
  }

  /**
   * addLegendPagesV4()
   * -------------------
   * Misma lógica que tu `addLegendPages`: empaqueta varias leyendas por página,
   * dibuja encabezado “Leyenda”, **no dibuja marco**, y NO pinta pie de página.
   * (El pie/paginación se dibuja después, desde el template, ya con el total real).
   */
  async addLegendPagesV4(
    doc: jsPDF,
    legends: LegendEntry[],
    opts?: { onAfterPage?: (doc: jsPDF) => void; drawFrame?: boolean }
  ): Promise<void> {
    if (!legends?.length) return;

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 10;
    const spacingY = 25;
    const titleFontSize = 16;
    const layerFontSize = 12;

    // Y inicial debajo del header “Leyenda”
    let currentY = margin + titleFontSize + 20;

    const drawHeader = () => {
      doc.setFont('helvetica', 'bold').setFontSize(titleFontSize);
      doc.text('Leyenda', pageWidth / 2, margin + titleFontSize, {
        align: 'center',
      });
      doc.setFont('helvetica', 'normal');
    };

    // Primera página de leyendas
    doc.addPage();
    drawHeader();

    // Helper para permitir que el caller haga algo al cerrar la página (no lo usamos en v4)
    const renderFooterIfAny = () => opts?.onAfterPage?.(doc);

    for (const lg of legends) {
      const { width, height } = await this.getImageSize(lg.dataUrl);
      const titleHeight = 10;

      // Mantén un límite de ocupación vertical similar al tuyo
      const maxH = pageHeight * 0.85;
      const scale = height > maxH ? maxH / height : 1;
      const w = width * scale;
      const h = height * scale;

      const totalNeeded = h + titleHeight + spacingY;

      // Si NO cabe, cerramos esta página y abrimos otra
      if (currentY + totalNeeded > pageHeight - margin) {
        renderFooterIfAny();
        doc.addPage();
        drawHeader();
        currentY = margin + titleFontSize + 20;
      }

      // Título centrado de la capa
      doc.setFontSize(layerFontSize);
      doc.text(lg.layerName || 'Leyenda', pageWidth / 2, currentY, {
        align: 'center',
      });
      currentY += titleHeight;

      // Imagen centrada
      const x = (pageWidth - w) / 2;
      doc.addImage(lg.dataUrl, 'PNG', x, currentY, w, h);
      currentY += h + spacingY;
    }

    // Última página de leyendas: callback si lo dieron (aunque en v4 no lo usamos)
    renderFooterIfAny();
  }

  // ==================================================
  // =================== Descargas ====================
  // ==================================================

  /**
   * safeFileName(base)
   * ------------------
   * Sanea un nombre base de archivo: reemplaza caracteres no permitidos por `_`.
   *
   * @param base Nombre base sugerido (sin extensión).
   * @returns    Nombre seguro.
   */
  private safeFileName(base: string) {
    return (base || 'mapa').replace(/[^a-z0-9_\-.]/gi, '_');
  }

  /**
   * downloadPdfBlob(pdf, title)
   * ---------------------------
   * Serializa el PDF a **Blob**, crea un **ObjectURL** y devuelve `{ url, name }`.
   *
   * @param pdf   Instancia `jsPDF`.
   * @param title Título para componer el nombre de archivo.
   */
  downloadPdfBlob(pdf: jsPDF, title: string): { url: string; name: string } {
    console.groupCollapsed('[PdfCommon] downloadPdfBlob');
    try {
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      const safeName = this.safeFileName(title) + '.pdf';
      console.debug('[PdfCommon] blob creado', {
        bytes: blob.size,
        name: safeName,
      });
      return { url, name: safeName };
    } catch (e) {
      console.error('[PdfCommon] error creando blob del PDF:', e);
      // En caso de error, devolvemos un nombre seguro sin URL
      return { url: '', name: this.safeFileName(title) + '.pdf' };
    } finally {
      console.groupEnd();
    }
  }

  /**
   * createPdfObjectUrl(pdf, title)
   * ------------------------------
   * Alias semántico de `downloadPdfBlob`.
   */
  createPdfObjectUrl(pdf: jsPDF, title: string) {
    return this.downloadPdfBlob(pdf, title);
  }

  /**
   * downloadUrl(url, filename)
   * --------------------------
   * Dispara una **descarga** creando un `<a>` temporal y simulando el clic.
   */
  downloadUrl(url: string, filename: string) {
    console.groupCollapsed('[PdfCommon] downloadUrl');
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      console.log('[PdfCommon] descarga disparada', { filename });
    } catch (e) {
      console.error('[PdfCommon] error disparando descarga:', e);
    } finally {
      console.groupEnd();
    }
  }

  /**
   * revokeUrl(url)
   * --------------
   * Intenta **revocar** un `ObjectURL` previamente creado.
   */
  revokeUrl(url: string) {
    console.groupCollapsed('[PdfCommon] revokeUrl');
    try {
      URL.revokeObjectURL(url);
      console.debug('[PdfCommon] ObjectURL revocado');
    } catch (e) {
      console.warn('[PdfCommon] error revocando ObjectURL (ignorado):', e);
    } finally {
      console.groupEnd();
    }
  }

  /**
   * downloadAndMaybeRevoke(url, filename, revokeAfterMs?)
   * -----------------------------------------------------
   * Descarga un `url` y, opcionalmente, lo **revoca** luego de `revokeAfterMs`.
   */
  downloadAndMaybeRevoke(
    url: string,
    filename: string,
    revokeAfterMs?: number
  ) {
    console.groupCollapsed('[PdfCommon] downloadAndMaybeRevoke');
    try {
      this.downloadUrl(url, filename);
      if (typeof revokeAfterMs === 'number' && revokeAfterMs >= 0) {
        setTimeout(() => this.revokeUrl(url), revokeAfterMs);
        console.debug('[PdfCommon] revocación programada', { revokeAfterMs });
      }
    } catch (e) {
      console.error('[PdfCommon] error en downloadAndMaybeRevoke:', e);
    } finally {
      console.groupEnd();
    }
  }

  // ==================================================
  // =================== Escalas ======================
  // ==================================================

  /**
   * getViewScaleDenominator(map)
   * ----------------------------
   * Calcula el **denominador de escala** `n` (1:n) desde la **resolución** de la vista.
   *
   * Fórmula:
   *   `n = resolución (unid/px) × metrosPorUnidad × pulgadasPorMetro × DPI`
   *
   * Donde:
   * - `metrosPorUnidad` se aproxima por transformación a EPSG:4326 (via `proj4`).
   * - **DPI** = 96, **pulgadasPorMetro** = 39.37 (alineado con la UI).
   *
   * @param map Mapa de OpenLayers (opcional).
   * @returns   Denominador `n` o `undefined` si falta información.
   */
  getViewScaleDenominator(map?: Map | null): number | undefined {
    try {
      if (!map) return;
      const view = map.getView();
      const resolution = view.getResolution() ?? undefined;
      const projectionCode = view.getProjection()?.getCode();
      if (!resolution || !projectionCode) return;

      const metersPerUnit = this.getMetersPerUnitByProj(projectionCode);
      const dpi = 96;
      const inchesPerMeter = 39.37;
      const n = resolution * metersPerUnit * inchesPerMeter * dpi;
      // 🔎 logging liviano (no group para no saturar)
      console.debug('[PdfCommon] escala 1:n estimada', Math.round(n));
      return n;
    } catch (e) {
      console.error('[PdfCommon] error calculando denominador de escala:', e);
      return undefined;
    }
  }

  /**
   * getPredefinedScaleFromMap(map, fallback?)
   * -----------------------------------------
   * Empareja el denominador `n` obtenido con la **escala predefinida** más cercana.
   *
   * @param map      Mapa de OpenLayers.
   * @param fallback Escala por defecto si no hay mapa o datos (default 1:50.000).
   */
  getPredefinedScaleFromMap(map?: Map | null, fallback?: Escala): Escala {
    try {
      const n = this.getViewScaleDenominator(map);
      if (typeof n === 'number') {
        const s = this.getEscalaMasCercana(n);
        console.debug('[PdfCommon] escala predefinida más cercana:', s);
        return s;
      }
      const fb =
        fallback ?? this.ESCALAS_PREDEFINIDAS.find(e => e.valor === 50000)!;
      console.warn('[PdfCommon] usando escala fallback:', fb);
      return fb;
    } catch (e) {
      console.error('[PdfCommon] error obteniendo escala predefinida:', e);
      return (
        fallback ?? this.ESCALAS_PREDEFINIDAS.find(e => e.valor === 50000)!
      );
    }
  }

  /**
   * getPredefinedScaleLabelFromMap(map, fallback?)
   * ----------------------------------------------
   * Devuelve el **label** "1:n" de la escala predefinida más cercana.
   */
  getPredefinedScaleLabelFromMap(map?: Map | null, fallback?: Escala): string {
    try {
      return this.getPredefinedScaleFromMap(map, fallback).nombre;
    } catch (e) {
      console.error('[PdfCommon] error obteniendo label de escala:', e);
      return (fallback ?? { nombre: '1:50.000' }).nombre;
    }
  }

  /**
   * getMetersPerUnitByProj(code)
   * ----------------------------
   * Obtiene una aproximación de **metros por unidad** a partir de la proyección,
   * comparando 1 unidad en X contra su delta lon/lat transformado a EPSG:4326.
   */
  private getMetersPerUnitByProj(projectionCode: string): number {
    try {
      const p1 = proj4(projectionCode, 'EPSG:4326', [0, 0]);
      const p2 = proj4(projectionCode, 'EPSG:4326', [1, 0]);
      const dx = p2[0] - p1[0];
      const mpu = Math.abs(dx) > 0 ? 111319.9 * Math.abs(dx) : 1;
      return mpu;
    } catch (e) {
      console.error('[PdfCommon] error calculando metrosPorUnidad:', e);
      return 1; // fallback para no romper cálculos
    }
  }

  /**
   * getEscalaMasCercana(valor)
   * --------------------------
   * Devuelve la **escala predefinida** cuyo denominador está más **cerca** de `valor`.
   */
  private getEscalaMasCercana(valor: number): Escala {
    try {
      return this.ESCALAS_PREDEFINIDAS.reduce((prev, curr) =>
        Math.abs(curr.valor - valor) < Math.abs(prev.valor - valor)
          ? curr
          : prev
      );
    } catch (e) {
      console.error('[PdfCommon] error buscando escala más cercana:', e);
      return this.ESCALAS_PREDEFINIDAS.find(e => e.valor === 50000)!;
    }
  }

  // ==================================================
  // ============== Layout de Texto (helpers) =========
  // ==================================================

  /**
   * layoutTextInArea(pdf, text, opts)
   * ---------------------------------
   * Envuuelve texto dentro de un rectángulo horizontal `[left .. right]` a **tamaño fijo**.
   * - Si `maxHeight` **no** se especifica: solo hace *wrap* en múltiples líneas.
   * - Si `maxHeight` **sí** se especifica y no cabe: **trunca la última** con elipsis.
   *
   * No dibuja nada; **solo calcula** líneas y métricas para que el consumidor
   * pinte donde quiera (por ejemplo, centrado).
   *
   * @returns `{ lines, height, lineHeight, maxWidth, xLeft, xRight, align }`
   */
  layoutTextInArea(
    pdf: jsPDF,
    text: string,
    opts: {
      left: number;
      right: number;
      fontSize: number;
      maxHeight?: number;
      maxLines?: number; // 👈 NUEVO
      shrinkToFitMinFontSize?: number; // 👈 NUEVO (p.ej. 9)
      lineHeightFactor?: number;
      font?: string;
      fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
      align?: 'left' | 'center' | 'right';
      ellipsis?: string;
    }
  ): {
    lines: string[];
    height: number;
    lineHeight: number;
    maxWidth: number;
    xLeft: number;
    xRight: number;
    align: 'left' | 'center' | 'right';
  } {
    console.groupCollapsed('[PdfCommon] layoutTextInArea');
    try {
      const {
        left,
        right,
        fontSize,
        maxHeight,
        maxLines,
        shrinkToFitMinFontSize = fontSize,
        lineHeightFactor = (
          pdf as unknown as { getLineHeightFactor?: () => number }
        ).getLineHeightFactor?.() ?? 1.15,
        font = 'helvetica',
        fontStyle = 'bold',
        align = 'left',
        ellipsis = '…',
      } = opts;

      const maxWidth = Math.max(1, right - left);
      const txt = (text ?? '').trim() || ' ';

      const compute = (size: number) => {
        pdf.setFont(font, fontStyle).setFontSize(size);
        const ls = pdf.splitTextToSize(txt, maxWidth) as string[];
        const lh = size * lineHeightFactor;
        return { size, lines: ls, lineHeight: lh, height: ls.length * lh };
      };

      // Paso 1: layout con tamaño base
      let { lines, lineHeight, height } = compute(fontSize);

      const violatesHeight = (h: number) => maxHeight != null && h > maxHeight;
      const violatesLines = (ls: string[]) =>
        maxLines != null && ls.length > Math.max(1, maxLines);

      // Paso 2: si no cumple restricciones, intentar shrink
      if (violatesHeight(height) || violatesLines(lines)) {
        for (
          let s = fontSize - 1;
          s >= Math.max(6, shrinkToFitMinFontSize);
          s--
        ) {
          const r = compute(s);
          lines = r.lines;
          lineHeight = r.lineHeight;
          height = r.height;
          if (!violatesHeight(height) && !violatesLines(lines)) break;
        }
      }

      // Paso 3: si aún viola, truncar con elipsis
      if (violatesHeight(height) || violatesLines(lines)) {
        // determinar máximo de líneas permitido por altura y/o tope explícito
        const byHeight =
          maxHeight != null
            ? Math.max(1, Math.floor(maxHeight / lineHeight))
            : Infinity;
        const byCap = maxLines != null ? Math.max(1, maxLines) : Infinity;
        const allowed = Math.max(1, Math.min(byHeight, byCap));

        lines = lines.slice(0, allowed);
        let last = lines[lines.length - 1] ?? '';
        while (
          pdf.getTextWidth(last + (ellipsis || ' ')) > maxWidth &&
          last.length > 0
        ) {
          last = last.slice(0, -1);
        }
        lines[lines.length - 1] = (last.trimEnd() + (ellipsis || '…')).trim();
        height = lines.length * lineHeight;
      }

      console.debug('[PdfCommon] layout result', {
        lines: lines.length,
        height,
        lineHeight,
        maxWidth,
        align,
      });

      return {
        lines,
        height,
        lineHeight,
        maxWidth,
        xLeft: left,
        xRight: right,
        align,
      };
    } catch (e) {
      console.error('[PdfCommon] error en layoutTextInArea:', e);
      // fallback mínimo para no romper al consumidor
      return {
        lines: [(text ?? '').slice(0, 80)],
        height: (opts.fontSize ?? 12) * 1.15,
        lineHeight: (opts.fontSize ?? 12) * 1.15,
        maxWidth: Math.max(1, (opts.right ?? 1) - (opts.left ?? 0)),
        xLeft: opts.left ?? 0,
        xRight: opts.right ?? 0,
        align: 'left',
      };
    } finally {
      console.groupEnd();
    }
  }

  /**
   * layoutTextRightWithLabel(pdf, text, opts)
   * -----------------------------------------
   * Maqueta un bloque **alineado a la derecha** con un **label** reservado a la izquierda.
   * - Tamaño de fuente **fijo** (no se reduce).
   * - Se hace *wrap*; si el alto excede `maxHeight`, se **trunca** con elipsis.
   *
   * @returns `{ lines, height, lineHeight, textLeft, textRight, maxWidth }`
   */
  layoutTextRightWithLabel(
    pdf: jsPDF,
    text: string,
    opts: {
      left: number;
      right: number;
      fontSize: number;
      lineHeightFactor?: number;
      font?: string;
      fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
      labelText?: string;
      labelFont?: string;
      labelFontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
      labelFontSize?: number;
      labelGap?: number;
      maxHeight?: number;
      maxLines?: number;
      shrinkToFitMinFontSize?: number;
      wrapWidthRatio?: number;
      rightPadPx?: number;
    }
  ): {
    lines: string[];
    height: number;
    lineHeight: number;
    textLeft: number;
    textRight: number;
    maxWidth: number; // ancho "seguro" realmente usado para partir
  } {
    console.groupCollapsed('[PdfCommon] layoutTextRightWithLabel');
    try {
      const {
        left,
        right,
        fontSize,
        lineHeightFactor = (
          pdf as unknown as { getLineHeightFactor?: () => number }
        ).getLineHeightFactor?.() ?? 1.15,
        font = 'helvetica',
        fontStyle = 'bold',
        labelText,
        labelFont = 'helvetica',
        labelFontStyle = 'normal',
        labelFontSize = 10,
        labelGap = 6,
        maxHeight,

        // parámetros ya existentes
        maxLines,
        shrinkToFitMinFontSize = fontSize,
        wrapWidthRatio = 0.75, // 70–80% recomendado
        rightPadPx = 3,
      } = opts;

      // ===== Reservar label
      let labelW = 0;
      if (labelText) {
        pdf.setFont(labelFont, labelFontStyle).setFontSize(labelFontSize);
        labelW = pdf.getTextWidth(labelText);
      }
      const textLeft = left + labelW + (labelText ? labelGap : 0);
      const textRight = right - rightPadPx; // acolchado a la derecha

      // Ancho disponible "bruto" y ancho "seguro" usado para el wrap
      const rawWidth = Math.max(10, textRight - textLeft);
      const safeWidth = Math.max(10, rawWidth * wrapWidthRatio);

      // Helper de layout a un tamaño dado
      const compute = (size: number) => {
        pdf.setFont(font, fontStyle).setFontSize(size);
        const ls = pdf.splitTextToSize(text || ' ', safeWidth) as string[];
        const lh = size * lineHeightFactor;
        return { size, lines: ls, lineHeight: lh, height: ls.length * lh };
      };

      // Layout base con el tamaño solicitado
      let { lines, lineHeight, height } = compute(fontSize);

      const violatesHeight = (h: number) => maxHeight != null && h > maxHeight;
      const violatesLines = (ls: string[]) =>
        maxLines != null && ls.length > Math.max(1, maxLines);

      // ===== Reducir tamaño hasta cumplir restricciones (sin truncar)
      if (violatesHeight(height) || violatesLines(lines)) {
        for (
          let s = fontSize - 1;
          s >= Math.max(6, shrinkToFitMinFontSize);
          s--
        ) {
          const r = compute(s);
          lines = r.lines;
          lineHeight = r.lineHeight;
          height = r.height;
          if (!violatesHeight(height) && !violatesLines(lines)) break;
        }
      }

      // Clamp final: ninguna línea puede superar safeWidth (recorte de seguridad por ancho de texto)
      pdf
        .setFont(font, fontStyle)
        .setFontSize(Math.max(6, shrinkToFitMinFontSize));
      for (let i = 0; i < lines.length; i++) {
        let ln = lines[i] ?? '';
        while (pdf.getTextWidth(ln || ' ') > safeWidth && ln.length > 0) {
          ln = ln.slice(0, -1);
        }
        lines[i] = ln.length ? ln : ' ';
      }

      console.debug('[PdfCommon] layoutRight result', {
        lines: lines.length,
        height,
        lineHeight,
        safeWidth,
      });

      return {
        lines,
        height,
        lineHeight,
        textLeft,
        textRight,
        maxWidth: safeWidth,
      };
    } catch (e) {
      console.error('[PdfCommon] error en layoutTextRightWithLabel:', e);
      // fallback mínimo para no romper al consumidor
      const safeWidth = Math.max(10, (opts.right ?? 20) - (opts.left ?? 0));
      return {
        lines: [(text ?? '').slice(0, 80)],
        height: (opts.fontSize ?? 12) * 1.15,
        lineHeight: (opts.fontSize ?? 12) * 1.15,
        textLeft: opts.left ?? 0,
        textRight: opts.right ?? 0,
        maxWidth: safeWidth,
      };
    } finally {
      console.groupEnd();
    }
  }
}
