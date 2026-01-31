import { Injectable } from '@angular/core';
import type { jsPDF } from 'jspdf';
import {
  PdfTemplate,
  PdfTemplateRenderArgs,
} from '../../../Interfaces/export-map/pdf-template';
import { PdfCommonService } from '../pdf-common-service/pdf-common.service';
import { MapService } from '@app/core/services/map-service/map.service';

type FooterMode = 'full' | 'pagination';

/**
 * Estructura mínima de la info de página expuesta por jsPDF en `internal`.
 * Solo necesitamos el número de página actual para la paginación del footer.
 */
interface JsPDFInternalInfo {
  pageNumber: number;
}

/**
 * Firma parcial del objeto `internal` de jsPDF usada para leer el # de página.
 * Marcada como opcional porque algunas versiones/adaptadores no lo exponen.
 */
interface JsPDFInternal {
  getCurrentPageInfo?: () => JsPDFInternalInfo;
}

/**
 * Plantilla PDF **Estándar v2 (rotulado)**: `StandardV2PdfTemplateService`
 * -----------------------------------------------------------------------
 * Genera un PDF con mapa y un **footer de 3 columnas**:
 * - **Columna 1**: Logo + *Título* + *Autor* (alineados a la derecha).
 * - **Columna 2**: Escala (texto) + Fecha.
 * - **Columna 3**: Paginación centrada (“Página” + número grande + “de N”).
 *
 * Características clave:
 * - Ajustes sutiles por **orientación** (portrait/landscape) en alturas y proporciones.
 * - El *título/autor* se maquetan a **tamaño fijo** con *wrap* y **elipsis** si exceden
 *   el alto máximo de su bloque (sin reducir el font-size).
 * - La **escala textual** se toma de `PdfCommonService.getPredefinedScaleLabelFromMap`,
 *   para que coincida con la lista de escalas del widget de UI.
 * - Páginas de **leyenda** opcionales con modo de footer `pagination` (solo columna 3).
 *
 * Dependencias:
 * - `PdfCommonService.loadImageAsDataURL` para rasterizar el logo (CORS → DataURL PNG).
 * - `PdfCommonService.layoutTextRightWithLabel` para maquetar “label + valor” alineado a la derecha.
 * - `PdfCommonService.addLegendPages` para paginado/centrado de leyendas.
 * - `MapService.getMap()` para acceder a la vista OL al calcular la escala textual.
 *
 * Notas:
 * - Se usa `putTotalPages('{total_pages_count_string}')` para reemplazar el placeholder
 *   `de {N}` al final del render.
 *
 * @author
 *  Sergio Alonso Mariño Duque
 * @date
 *  02-09-2025
 * @version
 *  2.0.0
 */
@Injectable({ providedIn: 'root' })
export class StandardV2PdfTemplateService implements PdfTemplate {
  /** Identificador interno de la plantilla. */
  readonly id = 'standard-v2' as const;
  /** Etiqueta visible en UI para seleccionar la plantilla. */
  readonly label = 'Estándar v2 (rotulado)';

  /**
   * @param common  Utilidades comunes de PDF (logo, leyendas, layout de textos, escalas).
   * @param mapSvc  Acceso al mapa de OpenLayers para calcular la escala textual.
   */
  constructor(
    private common: PdfCommonService,
    private mapSvc: MapService
  ) {}

  /**
   * FooterCreate()
   * --------------
   * Dibuja el **pie de página**. Tiene dos modos:
   * - `full`: Renderiza las **3 columnas** (Logo/Título/Autor, Escala/Fecha, Paginación).
   * - `pagination`: Renderiza **solo** la columna 3 con la paginación (usado en páginas de leyendas).
   *
   * Detalles de layout:
   * - La columna 1 reserva un **cuadro** para logo (máx. `logoSize`) y a su derecha ubica
   *   dos bloques: **Título** y **Autor**; ambos a tamaño **fijo** con *wrap* y **elipsis**
   *   si la altura excede el máximo disponible (no se reduce el tamaño del texto).
   * - La columna 2 escribe **Escala** y **Fecha** alineados a la derecha, forzando una sola
   *   línea (si no cabe, reduce el tamaño hasta `9pt` como mínimo).
   * - La columna 3 centra la **paginación** con un número grande y el placeholder “de N”.
   *
   * @param pdf        Instancia de `jsPDF` usada para dibujar.
   * @param W          Ancho de página en puntos.
   * @param H          Alto de página en puntos.
   * @param title      Título a mostrar (col1).
   * @param author     Autor a mostrar (col1).
   * @param scaleText  Texto de escala (col2), p. ej., “1:50.000”.
   * @param dateText   Fecha formateada (col2).
   * @param footerMode Modo del pie: `'full' | 'pagination'`.
   * @param logoUrl    URL del logo institucional (opcional).
   * @returns          `Promise<void>` (asíncrono por la posible carga del logo).
   */
  private async FooterCreate(
    pdf: jsPDF,
    W: number,
    H: number,
    title: string,
    author: string,
    scaleText: string,
    dateText: string,
    footerMode: FooterMode = 'full',
    logoUrl?: string
  ): Promise<void> {
    const isPortrait = H > W;

    // --- Parámetros visuales base (ligeros ajustes por orientación) ---
    const m = 24;
    const fh = isPortrait ? 92 : 96;
    const gap = 12;
    const r1 = isPortrait ? 0.56 : 0.58; // ancho relativo col1
    const r3 = isPortrait ? 0.2 : 0.18; // ancho relativo col3
    const logoSize = 80;
    const topPad = 12;

    // --- Área footer y cajas de columnas ---
    const cx = m;
    const cw = W - m * 2;
    const footTop = H - fh - 18;
    const y0 = footTop + topPad;
    const ch = fh - topPad;

    const c1w = cw * r1;
    const c3w = cw * r3;
    const c2w = cw - c1w - c3w - 2 * gap;

    const c1x = cx;
    const c2x = c1x + c1w + gap;
    const c3x = c2x + c2w + gap;

    const sepBlackX = c2x - gap / 2;

    // ======== SOLO PAGINACIÓN (páginas de leyenda) ========
    if (footerMode === 'pagination') {
      const blueX = c3x + 6;
      pdf.setDrawColor(7, 108, 179).setLineWidth(2.5);
      pdf.line(blueX, y0, blueX, y0 + ch);

      const TOTAL_PAGES_EXP = '{total_pages_count_string}';
      const pageNum =
        (
          pdf as unknown as { internal?: JsPDFInternal }
        ).internal?.getCurrentPageInfo?.().pageNumber ?? 1;

      const col3ContentLeft = blueX + 12;
      const col3ContentRight = c3x + c3w - 8;
      const xCenter = (col3ContentLeft + col3ContentRight) / 2;

      const pageLabelY = y0 + ch * 0.25;
      const bigNumY = y0 + ch * 0.65;

      pdf.setFont('helvetica', 'normal').setFontSize(10).setTextColor(0);
      pdf.text('Pagina', xCenter, pageLabelY, { align: 'center' });

      pdf
        .setFont('helvetica', 'bold')
        .setFontSize(isPortrait ? 24 : 26)
        .setTextColor(0);
      const numStr = String(pageNum);
      const numW = pdf.getTextWidth(numStr);
      pdf.text(numStr, xCenter - numW / 2, bigNumY);

      pdf.setFont('helvetica', 'normal').setFontSize(10).setTextColor(0);
      pdf.text(`de ${TOTAL_PAGES_EXP}`, xCenter + numW / 2 + 6, bigNumY);
      return;
    }

    // ======== FOOTER COMPLETO (primera página) ========
    // Barra superior
    pdf.setDrawColor(0).setLineWidth(2.2);
    pdf.line(m, footTop, W - m, footTop);

    // Separador negro entre col1 y col2 (offset -20)
    pdf.setDrawColor(0).setLineWidth(2);
    pdf.line(sepBlackX - 20, y0, sepBlackX - 20, y0 + ch);

    // Barra azul al inicio de col3
    const blueX = c3x + 6;
    pdf.setDrawColor(7, 108, 179).setLineWidth(2.5);
    pdf.line(blueX, y0, blueX, y0 + ch);

    // Logo (marco cuadrado)
    const box = Math.min(logoSize, ch);
    const bx = c1x;
    const by = y0 + (ch - box) / 2;

    // Imagen del logo (si hay URL válida)
    if (logoUrl) {
      try {
        const data = await this.common.loadImageAsDataURL(logoUrl);
        const pad = 8;
        const inner = box - pad * 2;

        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const im = new Image();
          im.onload = () => resolve(im);
          im.onerror = reject;
          im.src = data;
        });
        const r = img.width / img.height;
        let dw: number;
        let dh: number;
        if (r >= 1) {
          dw = inner;
          dh = inner / r;
        } else {
          dh = inner;
          dw = inner * r;
        }
        const dx = bx + pad + (inner - dw) / 2;
        const dy = by + pad + (inner - dh) / 2;
        pdf.addImage(data, 'PNG', dx, dy, dw, dh);
      } catch {
        // Si falla la carga del logo, se deja solo el marco.
      }
    }

    // ===== Col 1: Título / Autor (tamaño fijo con wrap/ellipsis) =====
    const rightPadding = 8;
    const rightEdge = sepBlackX - 20 - rightPadding;
    const textLeftBase = bx + box + 12;

    const lineHFactor =
      (
        pdf as unknown as { getLineHeightFactor?: () => number }
      ).getLineHeightFactor?.() ?? 1.15;

    // Tamaños fijos (no reducimos el font-size)
    const titleFontSize = isPortrait ? 11 : 12;
    const authorFontSize = isPortrait ? 10 : 11;
    const labelFontSize = 10;
    const gapBetween = 14;

    // Altura máxima disponible total para título+autor
    const maxTotalH = ch - 16;
    // Reparto (prioriza el título)
    const titleRatio = 0.7;
    const authorRatio = 1 - titleRatio;

    // Alturas máximas por bloque
    const titleMaxH = Math.max(0, (maxTotalH - gapBetween) * titleRatio);
    const authorMaxH = Math.max(0, (maxTotalH - gapBetween) * authorRatio);

    // knobs de seguridad (ajústalos si quieres más margen)
    const WRAP_RATIO = 0.75; // parte líneas al 75% del ancho disponible
    const RIGHT_PAD = 3; // 3 pt de acolchado con el borde derecho

    // Layout TÍTULO (hasta 4 líneas; reduce hasta 9pt antes de truncar)
    const titleLayout = this.common.layoutTextRightWithLabel(
      pdf as jsPDF,
      title,
      {
        left: textLeftBase,
        right: rightEdge,
        fontSize: titleFontSize,
        lineHeightFactor: lineHFactor,
        labelText: 'Título:',
        labelFontSize,
        labelGap: 6,
        maxHeight: titleMaxH,
        maxLines: 4,
        shrinkToFitMinFontSize: 9,
        wrapWidthRatio: WRAP_RATIO,
        rightPadPx: RIGHT_PAD,
      }
    );

    // Layout AUTOR (hasta 3 líneas; reduce hasta 9pt)
    const authorLayout = this.common.layoutTextRightWithLabel(
      pdf as jsPDF,
      author,
      {
        left: textLeftBase,
        right: rightEdge,
        fontSize: authorFontSize,
        lineHeightFactor: lineHFactor,
        labelText: 'Autor:',
        labelFontSize,
        labelGap: 6,
        maxHeight: authorMaxH,
        maxLines: 3,
        shrinkToFitMinFontSize: 9,
        wrapWidthRatio: WRAP_RATIO,
        rightPadPx: RIGHT_PAD,
      }
    );

    // Posiciones verticales
    const titleY = y0 + 12;
    const authorY = titleY + titleLayout.height + gapBetween;

    // Labels
    pdf
      .setFont('helvetica', 'normal')
      .setFontSize(labelFontSize)
      .setTextColor(60);
    pdf.text('Título:', textLeftBase, titleY);
    pdf.text('Autor:', textLeftBase, authorY);

    // ===== Valores (alineados a la derecha con clamp) =====
    const EPS = 0.5; // margen sub-píxel

    // TÍTULO
    pdf.setFont('helvetica', 'bold').setFontSize(titleFontSize).setTextColor(0);
    {
      let y = titleY;
      for (const line of titleLayout.lines) {
        const w = pdf.getTextWidth(line || ' ');
        // extremo derecho fijo y nunca cruzar el label
        const x = Math.max(
          titleLayout.textLeft,
          titleLayout.textRight - EPS - w
        );
        pdf.text(line, x, y, { align: 'left' });
        y += titleLayout.lineHeight;
      }
    }

    // AUTOR
    pdf
      .setFont('helvetica', 'bold')
      .setFontSize(authorFontSize)
      .setTextColor(0);
    {
      let y = authorY;
      for (const line of authorLayout.lines) {
        const w = pdf.getTextWidth(line || ' ');
        const x = Math.max(
          authorLayout.textLeft,
          authorLayout.textRight - EPS - w
        );
        pdf.text(line, x, y, { align: 'left' });
        y += authorLayout.lineHeight;
      }
    }

    // ===== Col 2: Escala / Fecha (alineado a la derecha, en una línea) =====
    const col2Left = c2x;
    const col2Right = c3x - 8;
    const labelToValueOffset = 92;
    const col2MaxW = Math.max(10, col2Right - (col2Left + labelToValueOffset));

    const col2RowH = (ch - 16) / 2;
    const escalaY = y0 + 12;
    const fechaY = y0 + 12 + col2RowH;

    pdf.setFont('helvetica', 'normal').setFontSize(10).setTextColor(60);
    pdf.text('Escala:', col2Left, escalaY);
    pdf.text('Fecha:', col2Left, fechaY);

    const fitRightOneLine = (txt: string, y: number, base: number) => {
      let size = base;
      while (size >= 9) {
        pdf.setFont('helvetica', 'bold').setFontSize(size).setTextColor(0);
        const w = pdf.getTextWidth(txt || ' ');
        if (w <= col2MaxW + 0.01) break;
        size -= 1;
      }
      pdf.text(txt || ' ', col2Right, y, { align: 'right' });
    };

    fitRightOneLine(scaleText, escalaY, isPortrait ? 10 : 11);
    fitRightOneLine(dateText, fechaY, isPortrait ? 10 : 11);

    // ===== Col 3: Paginación centrada =====
    const TOTAL_PAGES_EXP = '{total_pages_count_string}';
    const pageNum =
      (
        pdf as unknown as { internal?: JsPDFInternal }
      ).internal?.getCurrentPageInfo?.().pageNumber ?? 1;

    const col3ContentLeft = blueX + 12;
    const col3ContentRight = c3x + c3w - 8;
    const xCenter = (col3ContentLeft + col3ContentRight) / 2;

    const pageLabelY = y0 + ch * 0.25;
    const bigNumY = y0 + ch * 0.65;

    pdf.setFont('helvetica', 'normal').setFontSize(10).setTextColor(0);
    pdf.text('Pagina', xCenter, pageLabelY, { align: 'center' });

    pdf
      .setFont('helvetica', 'bold')
      .setFontSize(isPortrait ? 20 : 22)
      .setTextColor(0);
    const numStr = String(pageNum);
    const numW = pdf.getTextWidth(numStr);
    pdf.text(numStr, xCenter - numW / 2, bigNumY);

    pdf.setFont('helvetica', 'normal').setFontSize(10).setTextColor(0);
    pdf.text(`de ${TOTAL_PAGES_EXP}`, xCenter + numW / 2 + 6, bigNumY);
  }

  /**
   * render(args)
   * ------------
   * Dibuja el **mapa principal** y el **footer** (con paginación/leyendas si aplica).
   *
   * Flujo:
   * 1) Calcula el rectángulo disponible para el mapa y ajusta la imagen (auto-fit
   *    conservando proporción o `placement` explícito para mantener escala).
   * 2) Inserta el mapa (marco + imagen).
   * 3) Calcula **escala textual** a partir del mapa (`MapService`) y **fecha**.
   * 4) Dibuja el **footer completo** en la primera página.
   * 5) Si hay **leyendas**, agrega páginas y usa el modo de footer **pagination**.
   * 6) Sustituye el placeholder `{total_pages_count_string}` por el total real.
   *
   * @param args Parámetros de render de la plantilla (ver `PdfTemplateRenderArgs`).
   */
  async render(args: PdfTemplateRenderArgs): Promise<void> {
    const { pdf, formData, imgData, scale, legends, logoUrl } = args;

    const W = pdf.internal.pageSize.getWidth();
    const H = pdf.internal.pageSize.getHeight();

    // ===== Área del mapa (reserva espacio para pie) =====
    const m = 24;
    const mapTop = m - 16;
    const mapBottom = H - 140;
    const left = m + 10;
    const right = W - m - 10;
    const rectW = right - left;
    const rectH = mapBottom - mapTop;

    // Relación de aspecto para encajar imagen del canvas
    const cw = args.map?.canvasWidth ?? 1000;
    const ch = args.map?.canvasHeight ?? 660;
    const rRect = rectW / rectH;
    const rImg = cw / ch;

    let mapW: number;
    let mapH: number;
    if (rImg >= rRect) {
      mapW = rectW;
      mapH = mapW * (ch / cw);
    } else {
      mapH = rectH;
      mapW = mapH * (cw / ch);
    }

    const mapX = left + (rectW - mapW) / 2;
    const mapY = mapTop + (rectH - mapH) / 2;

    // Mapa (marco + imagen)
    pdf.setDrawColor(0).setLineWidth(0.8);
    pdf.rect(mapX, mapY, mapW, mapH);
    pdf.addImage(imgData, 'PNG', mapX, mapY, mapW, mapH);

    // Escala textual desde el mapa (predefinida más cercana)
    const olMap = this.mapSvc.getMap();
    const escalaAuto = this.common.getPredefinedScaleLabelFromMap(olMap);

    // Barra de escala gráfica (si venía en args.scale)
    if (scale?.dataUrl && scale.width && scale.height) {
      const sFactor = 0.3;
      const sW = scale.width * 0.75 * sFactor;
      const sH = scale.height * 0.75 * sFactor;
      pdf.addImage(
        scale.dataUrl,
        'PNG',
        left - 4,
        mapTop + mapH - sH + 28,
        sW,
        sH
      );
    }

    // Texto Escala y Fecha (col2)
    const escalaTxt =
      escalaAuto ||
      (scale as unknown as { label?: string })?.label ||
      (scale as unknown as { text?: string })?.text ||
      (scale as unknown as { display?: string })?.display ||
      (formData as unknown as { scale?: string })?.scale ||
      '';

    const fechaTxt = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'numeric',
      year: 'numeric',
    });

    // Página 1: footer completo (con logo)
    await this.FooterCreate(
      pdf as jsPDF,
      W,
      H,
      formData.title ?? '',
      formData.author ?? '',
      escalaTxt,
      fechaTxt,
      'full',
      logoUrl ?? undefined
    );

    // Páginas de leyenda: SOLO paginación
    if (formData.includeLegend && legends?.length) {
      await this.common.addLegendPages(pdf as jsPDF, legends, {
        drawFrame: false,
        onAfterPage: (doc: jsPDF) => {
          const w = doc.internal.pageSize.getWidth();
          const h = doc.internal.pageSize.getHeight();
          // No es necesario await: render sincrónico sobre la página actual
          void this.FooterCreate(doc, w, h, '', '', '', '', 'pagination');
        },
      });
    }

    // Sustituye {total_pages_count_string} para “de N”
    (pdf as unknown as { putTotalPages?: (s: string) => void }).putTotalPages?.(
      '{total_pages_count_string}'
    );
  }
}
