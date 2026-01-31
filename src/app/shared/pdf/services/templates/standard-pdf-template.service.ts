import { Injectable } from '@angular/core';
import {
  PdfTemplate,
  PdfTemplateRenderArgs,
} from '../../../Interfaces/export-map/pdf-template';
import { PdfCommonService } from '../pdf-common-service/pdf-common.service';

/**
 * Plantilla PDF **Estándar (PdfBuilder)**: `StandardPdfTemplateService`
 * --------------------------------------------------------------------
 * Renderiza un layout clásico con:
 * - **Marco exterior** proporcional al tamaño de la hoja.
 * - **Título** centrado en el encabezado (solo *wrap*, sin elipsis y sin variar el tamaño).
 * - **Mapa** encajado automáticamente en el área disponible o posicionamiento explícito (`placement`)
 *   para preservar escala del visor.
 * - **Barra de escala** sobre el rectángulo del mapa (esquina inferior–izquierda).
 * - **Pie** con 3 filas (Autor / Fecha / Créditos) y una celda para **logo** a la derecha.
 * - (Opcional) **Páginas de leyendas** mediante `PdfCommonService.addLegendPages`.
 *
 * Dependencias clave:
 * - `PdfCommonService.layoutTextInArea`: envuelve texto dentro de un ancho fijo
 *   respetando el `fontSize` (no lo reduce) y sin elipsis si no se indica `maxHeight`.
 * - `PdfCommonService.loadImageAsDataURL`: normaliza logos (CORS) a DataURL PNG.
 * - `PdfCommonService.addLegendPages`: paginado y centrado de leyendas.
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
export class StandardPdfTemplateService implements PdfTemplate {
  /** Identificador único de la plantilla (debe coincidir con el `TemplateId`). */
  readonly id = 'standard' as const;
  /** Etiqueta visible en UI para pickers/menús. */
  readonly label = 'Estándar (PdfBuilder)';

  /**
   * @param common Servicio común con utilidades para PDF (logo/leyendas/wrap de texto).
   */
  constructor(private common: PdfCommonService) {}

  /**
   * render(args)
   * ------------
   * Punto de entrada de la plantilla. Pinta el contenido del PDF en el `jsPDF` provisto.
   *
   * Flujo:
   * 1) Dibuja marco y **título** (centrado y envuelto, sin elipsis).
   * 2) Calcula el **área disponible** y coloca el mapa (por `placement` o auto-fit).
   * 3) Inserta la **barra de escala** sobre el mapa (si viene en `args.scale`).
   * 4) Dibuja el **pie** (3 filas + celda de logo) y rasteriza el **logo** si hay `logoUrl`.
   * 5) Si `includeLegend` y existen `legends`, agrega **páginas de leyendas**.
   *
   * Notas:
   * - El **título** usa `layoutTextInArea` sin `maxHeight`, por lo que *solo envuelve*;
   *   no se recorta ni se añaden puntos suspensivos.
   * - El **alto real** del bloque de título determina `headerBottom`, que a su vez
   *   define el alto disponible del mapa para evitar solapes.
   *
   * @param args Parámetros de renderización (mapa, escala, leyendas, logo, etc.).
   *             Ver `PdfTemplateRenderArgs`.
   */
  async render(args: PdfTemplateRenderArgs): Promise<void> {
    const { pdf, formData, imgData, scale, legends, logoUrl } = args;

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Margen exterior (ligeramente adaptativo por tamaño de hoja)
    const margin = Math.max(16, Math.min(28, Math.round(pageWidth * 0.03)));

    // 1) Marco exterior
    pdf.setDrawColor(0).setLineWidth(1.5);
    pdf.rect(margin / 2, margin / 2, pageWidth - margin, pageHeight - margin);

    // 2) Título centrado — SOLO wrap, SIN elipsis, SIN cambiar tamaño
    const title = (formData.title ?? '').trim() || ' ';
    const titleFontSize = 18;
    const titleTop = margin + 12;

    // - Sin `maxHeight` => no hay recorte ni “...”; solo salto de línea.
    // - `align: 'center'` produce líneas centradas con el mismo font-size.
    const titleLayout = this.common.layoutTextInArea(pdf, title, {
      left: margin,
      right: pageWidth - margin,
      fontSize: titleFontSize,
      lineHeightFactor: 1.15,
      align: 'center',
    });

    pdf.setFont('helvetica', 'bold').setFontSize(titleFontSize).setTextColor(0);
    // Dibujo línea por línea usando el lineHeight calculado
    titleLayout.lines.forEach((line, i) => {
      const y = titleTop + i * titleLayout.lineHeight;
      pdf.text(line, pageWidth / 2, y, { align: 'center' });
    });

    // Fondo inferior del encabezado basado en el ALTO REAL del título
    const headerBottom = titleTop + titleLayout.height + 8;

    // 3) Cálculo de área disponible para el mapa
    const contentW = pageWidth - 2 * margin;
    const footerRowH = 20;
    const footerH = footerRowH * 3 + 10; // 3 filas + padding
    const availH = Math.max(
      0,
      pageHeight - headerBottom - footerH - margin - 20
    );

    // 4) Dimensiones/posición del mapa
    let imgX: number, imgY: number, drawW: number, drawH: number;

    // 4.a) `placement` explícito: preserva escala del visor (coordenadas/medidas en pt)
    const placement = args.map?.placement;
    if (placement) {
      imgX = placement.left;
      imgY = placement.top;
      drawW = placement.widthPt;
      drawH = placement.heightPt;
    } else {
      // 4.b) Auto-fit conservando proporción del canvas original
      const cw = args.map?.canvasWidth ?? 1000;
      const ch = args.map?.canvasHeight ?? 660;

      const imgW = contentW;
      const imgH = (ch / cw) * imgW;

      drawW = imgW;
      drawH = imgH;

      // Si el alto excede el disponible, escalamos proporcionalmente
      if (drawH > availH) {
        const k = availH / drawH;
        drawH = availH;
        drawW = drawW * k;
      }

      // Centrado en el área de contenido
      imgX = (pageWidth - drawW) / 2;
      imgY = headerBottom + (availH - drawH) / 2;
    }

    // 5) Mapa (marco + imagen)
    pdf.setDrawColor(0).setLineWidth(2);
    pdf.rect(imgX, imgY, drawW, drawH);
    pdf.addImage(imgData, 'PNG', imgX, imgY, drawW, drawH);

    // 6) Barra de escala (esquina inferior–izquierda del rectángulo del mapa)
    if (scale?.dataUrl && scale.width && scale.height) {
      const factor = 0.3;
      const sW = scale.width * 0.75 * factor;
      const sH = scale.height * 0.75 * factor;

      const sX = imgX - 3;
      const sY = imgY + drawH - sH + 19;
      pdf.addImage(scale.dataUrl, 'PNG', sX, sY, sW, sH);
    }

    // 7) Pie: 3 filas (texto) + celda de logo (25% del ancho)
    const footX = margin / 2;
    const footY = pageHeight - margin / 2 - footerRowH * 3;
    const footerW = pageWidth - margin;
    const textW = footerW * 0.75;
    const logoWCell = footerW - textW;

    pdf.setDrawColor(0).setLineWidth(1);
    // Líneas horizontales de la tabla
    for (let i = 0; i <= 3; i++) {
      pdf.line(
        footX,
        footY + i * footerRowH,
        footX + textW,
        footY + i * footerRowH
      );
    }
    // Bordes y divisor vertical
    pdf.line(footX, footY, footX, footY + footerRowH * 3);
    pdf.line(footX + textW, footY, footX + textW, footY + footerRowH * 3);
    pdf.line(footX + footerW, footY, footX + footerW, footY + footerRowH * 3);

    // Contenido textual del pie
    pdf.setFont('helvetica', 'normal').setFontSize(10);
    const author = (formData.author ?? '').trim();
    pdf.text(`Autor: ${author}`, footX + 5, footY + footerRowH - 4);
    pdf.text(
      `Fecha: ${new Date().toLocaleString()}`,
      footX + 5,
      footY + 2 * footerRowH - 4
    );
    pdf.text(
      `Créditos: Generado en el Visor Geográfico`,
      footX + 5,
      footY + 3 * footerRowH - 4
    );

    // Celda y render del logo (silencioso si falla la carga)
    const logoCellX = footX + textW;
    const logoCellY = footY;
    const logoCellW = logoWCell;
    const logoCellH = footerRowH * 3;

    pdf.rect(logoCellX, logoCellY, logoCellW, logoCellH);

    if (logoUrl) {
      try {
        // 1) Normaliza a DataURL PNG (CORS) con tu servicio común
        const data = await this.common.loadImageAsDataURL(logoUrl);

        // 2) Lee dimensiones naturales del PNG
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const im = new Image();
          im.onload = () => resolve(im);
          im.onerror = reject;
          im.src = data;
        });

        // 3) Caja interna (con padding) donde el logo debe caber
        const pad = 8; // ajusta si quieres más/menos aire
        const innerW = Math.max(2, logoCellW - pad * 2);
        const innerH = Math.max(2, logoCellH - pad * 2);

        // 4) Escala proporcional SIN deformar (fit-contain)
        const r = Math.min(innerW / img.width, innerH / img.height);
        const dw = img.width * r;
        const dh = img.height * r;

        // 5) Centrado dentro de la celda
        const dx = logoCellX + (logoCellW - dw) / 2;
        const dy = logoCellY + (logoCellH - dh) / 2;

        // 6) Pintar
        pdf.addImage(data, 'PNG', dx, dy, dw, dh);
      } catch {
        // silencioso: si falla el logo, no rompe el render
      }
    }

    // 8) Páginas de leyendas (si aplica)
    if (formData.includeLegend && legends?.length) {
      await this.common.addLegendPages(pdf, legends);
    }
  }
}
