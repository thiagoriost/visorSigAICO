// src/app/shared/pdf/services/templates/standard-v4-pdf-template.service.ts
import { Injectable } from '@angular/core';

import {
  PdfTemplate,
  PdfTemplateRenderArgs,
} from '../../../Interfaces/export-map/pdf-template';
import { PdfCommonService } from '../pdf-common-service/pdf-common.service';

/**
 * Plantilla PDF **Estándar v4 (rótulo)**: `StandardV4PdfTemplateService`
 * ----------------------------------------------------------------------
 * Renderiza un documento con:
 * - **Mapa** principal en la parte superior (auto-fit o con `placement` para
 *   conservar la escala real del visor).
 * - **Barra de escala** posicionada sobre el rectángulo del mapa.
 * - **Rótulo inferior** sin marco exterior (fondo gris claro con esquinas
 *   redondeadas) que contiene **logo**, **título**, **autor**, **fecha** y
 *   **paginación** (“Página X de Y”).
 * - **Páginas de leyendas** posteriores (si se solicita), sin marco exterior
 *   y con la paginación ubicada en la misma posición que la portada.
 *
 * Responsabilidades clave:
 * - Respetar el **layout** y la **tipografía** del rótulo.
 * - Encajar el mapa **sin deformar** (auto-fit) o en la posición exacta si
 *   se provee `map.placement` (para mantener escala del visor).
 * - Colocar la **paginación** con un estilo consistente en **todas** las páginas
 *   (portada + leyendas).
 *
 * Flujo de render:
 * 1) Calcular margenes útiles y alto reservado del **rótulo**.
 * 2) Dibujar el **mapa** (rectángulo + imagen) y la **barra de escala**.
 * 3) Pintar el **rótulo** (caja redondeada, logo, título, autor, fecha).
 * 4) Generar (si aplica) páginas de **leyenda** con `PdfCommonService.addLegendPages`,
 *    sin marco exterior; luego **añadir la paginación** en esas páginas.
 * 5) Escribir por último la **paginación de portada** (“Página 1 de N”).
 *
 * Notas:
 * - La caja redondeada del rótulo intenta utilizar `roundedRect` si la
 *   implementación de jsPDF la expone; si no, cae en `rect(...)`.
 * - La fecha se formatea en español con `spanishDate`.
 * - La paginación de leyendas se escribe **después** de agregarlas, cuando
 *   ya se conoce el total de páginas.
 *
 * @author
 *  Sergio Alonso Mariño Duque
 * @date
 *  22-09-2025
 * @version
 *  1.1.0
 */
@Injectable({ providedIn: 'root' })
export class StandardV4PdfTemplateService implements PdfTemplate {
  /** Identificador del template (debe coincidir con el TemplateId usado por el builder). */
  readonly id = 'standard-v4' as const;
  /** Etiqueta visible en pickers/menús. */
  readonly label = 'Estándar v4 (rótulo)';

  constructor(private common: PdfCommonService) {}

  /**
   * render()
   * --------
   * Punto de entrada de la plantilla. Dibuja mapa, barra de escala, rótulo y,
   * si corresponde, páginas de leyendas con paginación uniforme.
   *
   * @param args Parámetros de render provistos por el orquestador/builder:
   *             `pdf`, `formData`, `imgData`, `scale`, `legends`, `logoUrl`, `map`.
   */
  async render(args: PdfTemplateRenderArgs): Promise<void> {
    const { pdf, formData, imgData, scale, legends, logoUrl, map } = args;

    // Tipo literal para el "style" de fill/draw de jsPDF
    type FillDrawStyle = 'S' | 'D' | 'F' | 'FD' | 'DF';

    // Tamaño de página (pt)
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // ========= Layout base (sin marco exterior) ==============================
    const marginX = Math.max(14, Math.min(26, Math.round(pageWidth * 0.025)));

    // ⬆⬆ AJUSTE: margen superior **muy pequeño** para empujar el mapa arriba
    const marginTop = 6; // antes ~12–22; ahora mínimo para liberar más espacio abajo

    // ========= MAPA (zona superior) =========================================
    const ribbonH = 84; // alto reservado para el rótulo inferior
    const contentTop = marginTop;
    const availableH = Math.max(
      60,
      pageHeight - marginTop - ribbonH - contentTop
    );
    const contentW = pageWidth - 2 * marginX;

    let imgX: number, imgY: number, drawW: number, drawH: number;

    if (map?.placement) {
      // A) Posición explícita (mantiene escala del visor)
      imgX = map.placement.left;
      // ⬆⬆ AJUSTE: si el orquestador manda un top “alto”, lo **clampeamos** a margen superior mínimo
      imgY = Math.min(map.placement.top, marginTop);
      drawW = map.placement.widthPt;
      drawH = map.placement.heightPt;
    } else {
      // B) Auto-fit manteniendo proporción del canvas original
      const cw = map?.canvasWidth ?? 1000;
      const ch = map?.canvasHeight ?? 660;

      drawW = contentW;
      drawH = (ch / cw) * drawW;
      if (drawH > availableH) {
        const k = availableH / drawH;
        drawH = availableH;
        drawW *= k;
      }

      imgX = marginX + (contentW - drawW) / 2;
      // ⬆⬆ AJUSTE: pegamos al **margen superior mínimo**
      imgY = contentTop;
    }

    // Rectángulo del mapa + imagen
    pdf.setDrawColor(0).setLineWidth(1.2);
    pdf.rect(imgX, imgY, drawW, drawH);
    pdf.addImage(imgData, 'PNG', imgX, imgY, drawW, drawH);

    // Barra de escala (dentro del mapa) —> puedes desactivarlo si la pondrás fuera
    if (scale?.dataUrl && scale.width && scale.height) {
      const factor = 0.3;
      const sW = scale.width * 0.75 * factor;
      const sH = scale.height * 0.75 * factor;
      const sX = imgX + 3;
      const sY = imgY + drawH - sH + 18;
      pdf.addImage(scale.dataUrl, 'PNG', sX, sY, sW, sH);
    }

    // ========= RÓTULO INFERIOR (fondo gris, esquinas redondeadas) ===========
    const ribbonX = marginX - 4;
    const ribbonY = pageHeight - ribbonH - marginTop + 8;
    const ribbonW = pageWidth - 2 * (marginX - 4);
    const cornerR = 6;

    pdf.setFillColor(235, 236, 238); // gris claro
    pdf.setDrawColor(210, 210, 210);

    // Intentar roundedRect si está disponible; si no, rect(...)
    const anyPdf = pdf as unknown as Record<string, unknown>;
    const rr = anyPdf['roundedRect'] as
      | ((
          x: number,
          y: number,
          w: number,
          h: number,
          rx: number,
          ry: number,
          style?: string
        ) => void)
      | undefined;

    if (typeof rr === 'function') {
      rr.call(
        pdf,
        ribbonX,
        ribbonY,
        ribbonW,
        ribbonH,
        cornerR,
        cornerR,
        'FD' as FillDrawStyle
      );
    } else {
      (pdf as import('jspdf').jsPDF).rect(
        ribbonX,
        ribbonY,
        ribbonW,
        ribbonH,
        'FD' as FillDrawStyle
      );
    }

    // Área interna del rótulo
    const pad = 12;
    const innerX = ribbonX + pad;
    const innerY = ribbonY + pad;
    const innerW = ribbonW - pad * 2;
    const innerH = ribbonH - pad * 2;

    // Celda del LOGO (izquierda)
    const logoCellW = 70;
    const logoCellH = innerH;
    const logoCellX = innerX;
    const logoCellY = innerY;

    // Área de texto (derecha del logo)
    const textAreaX = logoCellX + logoCellW + 12;
    const textAreaW = innerW - logoCellW - 12;

    // Dos columnas: izquierda (título/autor) y derecha (fecha/página)
    const rightColW = 140;
    const leftColW = textAreaW - rightColW - 16;
    const leftColX = textAreaX;
    const rightColX = leftColX + leftColW + 16;

    // LOGO (fit-contain dentro de la celda)
    if (logoUrl) {
      try {
        const data = await this.common.loadImageAsDataURL(logoUrl);
        const img = await this.loadHTMLImage(data);
        const padL = 8;
        const iW = logoCellW - padL * 2;
        const iH = logoCellH - padL * 2;
        const r = Math.min(iW / img.width, iH / img.height);
        const dw = img.width * r;
        const dh = img.height * r;
        const dx = logoCellX + (logoCellW - dw) / 2;
        const dy = logoCellY + (logoCellH - dh) / 2;
        pdf.addImage(data, 'PNG', dx, dy, dw, dh);
      } catch {
        /* Si falla, no interrumpe el render */
      }
    }

    // ========= Contenido textual del rótulo =================================
    const title = (formData.title ?? '').trim();
    const author = (formData.author ?? '').trim();
    const fecha = this.spanishDate(new Date());

    // Fila 1: Título (izq.) | Fecha (der.)
    const row1Y = innerY + 16;
    pdf.setFont('helvetica', 'normal').setFontSize(10);
    pdf.text('Título:', leftColX, row1Y);

    pdf.setFont('helvetica', 'bold').setFontSize(12);
    const titleLayout = this.common.layoutTextInArea(pdf, title || ' ', {
      left: leftColX + 40,
      right: leftColX + leftColW,
      fontSize: 12,
      lineHeightFactor: 1.15,
      align: 'left',
    });
    titleLayout.lines.slice(0, 2).forEach((line, i) => {
      pdf.text(line, leftColX + 40, row1Y + i * titleLayout.lineHeight);
    });

    pdf.setFont('helvetica', 'bold').setFontSize(10);
    pdf.text('Fecha:', rightColX, row1Y);
    pdf.setFont('helvetica', 'normal').setFontSize(10);
    pdf.text(fecha, rightColX + 38, row1Y);

    // Fila 2: Autor (izq.) | Página X de Y (der., sin “:”)
    const row2Y = innerY + 16 + 26;
    pdf.setFont('helvetica', 'normal').setFontSize(10);
    pdf.text('Autor:', leftColX, row2Y);

    pdf.setFont('helvetica', 'bold').setFontSize(11);
    const authorLayout = this.common.layoutTextInArea(pdf, author || ' ', {
      left: leftColX + 40,
      right: leftColX + leftColW,
      fontSize: 11,
      lineHeightFactor: 1.15,
      align: 'left',
    });
    authorLayout.lines.slice(0, 2).forEach((line, i) => {
      pdf.text(line, leftColX + 40, row2Y + i * authorLayout.lineHeight);
    });

    // Coordenadas de la paginación (se reutilizan para todas las páginas)
    const pageTextX = rightColX;
    const pageTextY = row2Y;

    // ========= LEYENDAS (páginas posteriores) ===============================
    if (formData.includeLegend && legends?.length) {
      // 1) Agregar páginas de leyendas sin marco ni footer.
      await this.common.addLegendPages(pdf, legends, { drawFrame: false });

      // 2) Añadir paginación en cada página de leyenda (misma posición de la portada).
      const totalPages = pdf.getNumberOfPages();
      for (let p = 2; p <= totalPages; p++) {
        pdf.setPage(p);
        pdf.setFont('helvetica', 'bold').setFontSize(10).setTextColor(0);
        pdf.text(`Página ${p} de ${totalPages}`, pageTextX, pageTextY);
      }

      // 3) Volver a la portada y escribir “Página 1 de N”.
      pdf.setPage(1);
      pdf.setFont('helvetica', 'bold').setFontSize(10).setTextColor(0);
      pdf.text(`Página 1 de ${totalPages}`, pageTextX, pageTextY);

      // (opcional) dejar seleccionada la última página
      pdf.setPage(totalPages);
    }

    // ========= Paginación de PORTADA (garantiza texto en la página 1) =======
    const totalPages = pdf.getNumberOfPages();
    const prevPage = pdf.getCurrentPageInfo().pageNumber;

    pdf.setPage(1);
    pdf.setFont('helvetica', 'bold').setFontSize(10).setTextColor(0);
    pdf.text(`Página 1 de ${totalPages}`, pageTextX, pageTextY);

    // Regresar a la página previa (suele ser la última)
    if (prevPage && prevPage !== 1) pdf.setPage(prevPage);
  }

  // ==========================================================================
  // Helpers privados
  // ==========================================================================

  private async loadHTMLImage(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = dataUrl;
    });
  }

  private spanishDate(d: Date): string {
    const dd = ('0' + d.getDate()).slice(-2);
    const months = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];
    return `${dd} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }
}
