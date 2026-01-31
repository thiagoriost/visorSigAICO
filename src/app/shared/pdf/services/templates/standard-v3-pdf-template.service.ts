// src/app/shared/pdf/services/templates/standard-v3-pdf-template.service.ts
import { Injectable } from '@angular/core';
import type { jsPDF } from 'jspdf';

import {
  PdfTemplate,
  PdfTemplateRenderArgs,
} from '../../../Interfaces/export-map/pdf-template';
import { PdfCommonService } from '../pdf-common-service/pdf-common.service';

/** Placeholder usado por jsPDF para total de páginas. */
const TOTAL_PAGES_EXP = '{total_pages_count_string}';

/** Alto del rótulo tipo CRIC (pie) en la página 1. */
const CRIC_FOOTER_HEIGHT = 90;

/** Ajuste fino: desplaza el mapa en vertical (pt). Negativo = sube. */
const MAP_TOP_OFFSET_PT = 20;

/** Ajuste fino: desplaza el footer a la izquierda (pt). */
const FOOTER_LEFT_OFFSET_PT = -12;

/** Extensión de jsPDF con `putTotalPages` tipada de forma segura. */
type JsPdfWithTotal = jsPDF & {
  putTotalPages?: (placeholder?: string) => jsPDF;
};

/**
 * Plantilla PDF **Estándar v3**: `StandardV3PdfTemplateService`
 * -------------------------------------------------------------
 * Genera un PDF con:
 * - **Página 1**: Mapa con marco, barra de escala en la esquina inf.-izq. y
 *   **rótulo tipo CRIC** en el pie (logo, contenido, autor, fecha, folio).
 * - **Páginas de leyenda** (si aplica): sin marco y con **badge** minimalista
 *   de paginación en la esquina inf.-der. (estilo “2 / N” sobre caja gris).
 *
 * Diferencias clave vs v2:
 * - En **v3** el rótulo tipo CRIC se renderiza solo en la primera página.
 * - Las **páginas de leyenda** usan un **badge compacto** (no el footer completo).
 * - Se elimina el **recuadro** alrededor de las leyendas (`drawFrame: false`).
 *
 * Dependencias:
 * - `PdfCommonService.loadImageAsDataURL` para rasterizar el logo (CORS → DataURL PNG).
 * - `PdfCommonService.addLegendPages` para paginar y centrar leyendas.
 *
 * Notas:
 * - Se usa `putTotalPages('{total_pages_count_string}')` para reemplazar el
 *   placeholder por el total real de páginas al final del render.
 *
 * @author
 *  Sergio Alonso Mariño Duque
 * @date
 *  09-2025
 * @version
 *  3.0.0
 */
@Injectable({ providedIn: 'root' })
export class StandardV3PdfTemplateService implements PdfTemplate {
  /** Identificador interno de la plantilla. */
  readonly id = 'standard-v3' as const;
  /** Etiqueta visible en UI para seleccionar la plantilla. */
  readonly label = 'Estándar v3';

  constructor(private common: PdfCommonService) {}

  /**
   * drawCRICFooter()
   * ----------------
   * Dibuja el **rótulo tipo CRIC** en el pie de la **primera página**.
   * Composición:
   * - Panel gris principal con dos columnas (Contenido/Autor y Fecha/Origen).
   * - Logo institucional a la izquierda.
   * - Bloque de **folio** grande a la derecha “N / {total}”.
   *
   * Detalles:
   * - Aplica un **desplazamiento horizontal** sutil (`FOOTER_LEFT_OFFSET_PT`).
   * - Devuelve `{ topY, bottomY }` por si se requiere saber el área ocupada.
   *
   * @param pdf     Instancia de `jsPDF`.
   * @param args    `{ formData, logoUrl, pageNo? }` información contextual.
   * @returns       `Promise<{ topY: number; bottomY: number }>`
   */
  private async drawCRICFooter(
    pdf: jsPDF,
    args: Pick<PdfTemplateRenderArgs, 'formData' | 'logoUrl'> & {
      pageNo?: number;
    }
  ): Promise<{ topY: number; bottomY: number }> {
    const { formData, logoUrl, pageNo = 1 } = args;

    const pageW = pdf.internal.pageSize.getWidth();
    const margin = 24;

    const leftPad = margin / 2 + FOOTER_LEFT_OFFSET_PT;
    const rightPad = margin / 2;
    const height = CRIC_FOOTER_HEIGHT;
    const radius = 8;

    const bottomY = pdf.internal.pageSize.getHeight() - margin / 2;
    const topY = bottomY - height;

    // 1) Logo (bloque a la izquierda)
    const logoBoxW = 120;
    const logoX = leftPad;
    const logoY = topY + 6;

    if (logoUrl) {
      try {
        const logoData = await this.common.loadImageAsDataURL(logoUrl);
        pdf.addImage(logoData, 'PNG', logoX + 6, logoY - 2, 95, 95);
      } catch {
        // Si falla la carga del logo, continuamos sin él.
      }
    }

    // 2) Panel gris (contenido del rótulo)
    const panelX = logoBoxW + leftPad + 10;
    const panelW = pageW - panelX - rightPad;
    const panelY = topY;

    pdf.setFillColor(235, 235, 235);
    pdf.roundedRect(panelX, panelY, panelW, height, radius, radius, 'F');

    // Columnas
    const colGap = 18;
    const folioBlockW = 110;
    const colW = (panelW - colGap - folioBlockW) / 2;
    const leftColX = panelX + 22;
    const rightColX = leftColX + colW + colGap;
    const baseY = panelY + 20;

    const smallLabel = (label: string, x: number, y: number, maxW: number) => {
      pdf.setFont('helvetica', 'bold').setFontSize(10);
      pdf.text(label, x, y);
      const lineY = y + 3;
      pdf.setLineWidth(0.7);
      pdf.line(x, lineY, x + maxW, lineY);
    };
    const smallValue = (value: string, x: number, y: number, maxW: number) => {
      pdf.setFont('helvetica', 'normal').setFontSize(11);
      pdf.text(value || '-', x, y, { maxWidth: maxW });
    };

    // Columna izquierda
    smallLabel('Contenido', leftColX, baseY, colW);
    smallValue(formData.title, leftColX, baseY + 12, colW);

    smallLabel('Autor', leftColX, baseY + 38, colW);
    smallValue(formData.author, leftColX, baseY + 50, colW);

    // Columna derecha
    smallLabel('Fecha', rightColX, baseY, colW);
    const fecha = new Date().toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    smallValue(fecha, rightColX, baseY + 12, colW);

    smallLabel('Origen', rightColX, baseY + 38, colW);
    smallValue(
      'Sistema de Información Geográfica del CRID',
      rightColX,
      baseY + 50,
      colW
    );

    // Folio grande (N / {total})
    const folioX = panelX + panelW - folioBlockW;
    pdf.setFont('helvetica', 'bold').setFontSize(52);
    pdf.text(String(pageNo), folioX + 44, panelY + 64, { align: 'center' });
    pdf.setFont('helvetica', 'normal').setFontSize(12);
    pdf.text(`/ ${TOTAL_PAGES_EXP}`, folioX + 82, panelY + 64, {
      align: 'left',
    });

    return { topY, bottomY };
  }

  /**
   * drawCornerPaginationBadge()
   * ---------------------------
   * Dibuja el **badge** minimalista de paginación en las **páginas de leyenda**.
   * Estilo:
   * - Caja redondeada gris en esquina inferior-derecha.
   * - Texto compacto: **N** (grande) seguido de “/ {total}” (pequeño),
   *   maquetados como un **bloque alineado a la derecha** dentro del badge.
   *
   * Notas:
   * - No usa el rótulo CRIC; es específico de páginas de leyenda.
   * - El ancho del badge es **compacto** (`BADGE_W = 120`).
   *
   * @param pdf Instancia de `jsPDF` sobre la página actual.
   */
  private drawCornerPaginationBadge(pdf: jsPDF): void {
    const W = pdf.internal.pageSize.getWidth();
    const H = pdf.internal.pageSize.getHeight();

    // Tamaño/estética del badge
    const PAD = 18; // separación del borde de página
    const BADGE_W = 120; // ancho compacto
    const BADGE_H = 82;
    const BADGE_RADIUS = 14;
    const INNER_PAD = 14; // padding interno del badge
    const GAP = 6; // separación entre número y “/ N”

    // Posición (esquina inferior derecha)
    const bx = W - PAD - BADGE_W;
    const by = H - PAD - BADGE_H;

    // Fondo gris del badge
    pdf.setFillColor(230, 230, 230);
    pdf.roundedRect(bx, by, BADGE_W, BADGE_H, BADGE_RADIUS, BADGE_RADIUS, 'F');

    // Página actual (N)
    const pageNum =
      (
        pdf as unknown as {
          internal?: { getCurrentPageInfo?: () => { pageNumber: number } };
        }
      ).internal?.getCurrentPageInfo?.().pageNumber ?? 1;

    // Medidas de textos
    const BIG_SIZE = 48;
    const SMALL_SIZE = 14;
    const baselineY = by + BADGE_H / 2 + 10; // línea base visual

    const numStr = String(pageNum);
    pdf.setFont('helvetica', 'bold').setTextColor(40).setFontSize(BIG_SIZE);
    const numW = pdf.getTextWidth(numStr);

    const slashStr = `/ ${TOTAL_PAGES_EXP}`;
    pdf.setFont('helvetica', 'normal').setTextColor(40).setFontSize(SMALL_SIZE);
    const slashW = pdf.getTextWidth(slashStr);

    // Componer como bloque alineado a la derecha
    const blockW = numW + GAP + slashW;
    const rightEdge = bx + BADGE_W - INNER_PAD;
    const leftX = Math.max(bx + INNER_PAD, rightEdge - blockW);

    // Número grande (izquierda del bloque)
    pdf.setFont('helvetica', 'bold').setFontSize(BIG_SIZE).setTextColor(40);
    pdf.text(numStr, leftX, baselineY, { align: 'left' });

    // “/ N” (pequeño), inmediatamente a la derecha del número
    const slashY = baselineY - 6; // ajuste vertical sutil
    const slashX = leftX + numW + GAP;
    pdf.setFont('helvetica', 'normal').setFontSize(SMALL_SIZE).setTextColor(40);
    pdf.text(slashStr, slashX, slashY, { align: 'left' });
  }

  /**
   * render(args)
   * ------------
   * Dibuja el **mapa principal**, la **barra de escala** (inf.-izq.),
   * el **pie tipo CRIC** en la primera página y las **páginas de leyenda**
   * (sin marco) con **badge** de paginación en la esquina.
   *
   * Flujo:
   * 1) Calcula el área disponible para el mapa y encaja la imagen (auto-fit
   *    o `placement` explícito para mantener escala).
   * 2) Inserta el mapa (marco + imagen) y la barra de escala.
   * 3) Dibuja el **footer CRIC** solo en la página 1.
   * 4) Si hay **leyendas**, agrega páginas con `drawFrame: false` y badge.
   * 5) Sustituye el placeholder `{total_pages_count_string}` por el total real.
   *
   * @param args Parámetros de render de la plantilla (ver `PdfTemplateRenderArgs`).
   */
  async render(args: PdfTemplateRenderArgs): Promise<void> {
    const { pdf, formData, imgData, scale, legends, logoUrl, map } = args;

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 24;

    // Reservas: pie + pequeños respiros
    const footerReserved = CRIC_FOOTER_HEIGHT + 10;
    const topReserved = margin / 2 + MAP_TOP_OFFSET_PT;

    // --- Cálculo del área del mapa ---
    let imgX: number;
    let imgY: number;
    let imgW: number;
    let imgH: number;

    if (map?.placement) {
      // Colocación explícita (mantener escala)
      const p = map.placement;
      imgX = p.left;
      imgY = p.top - 40; // ajuste heredado del servicio original
      imgW = p.widthPt;
      imgH = p.heightPt;
    } else {
      // Auto-fit dentro del área disponible
      const contentWidth = pageW - margin; // sin marco exterior rígido
      const availableH = pageH - topReserved - footerReserved - margin / 2;

      const cw = map?.canvasWidth ?? 1000;
      const ch = map?.canvasHeight ?? 660;

      imgW = contentWidth;
      imgH = (ch / cw) * imgW;

      if (imgH > availableH) {
        const s = availableH / imgH;
        imgH = availableH;
        imgW = imgW * s;
      }

      imgX = (pageW - imgW) / 2;
      imgY = topReserved + (availableH - imgH) / 2;
    }

    // --- Marco e imagen del mapa ---
    pdf.setDrawColor(0).setLineWidth(2).rect(imgX, imgY, imgW, imgH);
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgW, imgH);

    // --- Barra de escala (esquina inf.-izq. del mapa) ---
    if (scale?.dataUrl && scale.width && scale.height) {
      const factorEscala = 0.3;
      const sW = scale.width * 0.75 * factorEscala;
      const sH = scale.height * 0.75 * factorEscala;

      const ypad = 29;
      const xpad = 3;
      const sX = imgX - xpad;
      const sY = imgY + imgH - sH + ypad;
      pdf.addImage(scale.dataUrl, 'PNG', sX, sY, sW, sH);
    }

    // --- Pie CRIC (solo página 1) ---
    await this.drawCRICFooter(pdf, { formData, logoUrl, pageNo: 1 });

    // --- Leyendas: SIN marco + badge de paginación en esquina ---
    if (formData.includeLegend && legends?.length) {
      await this.common.addLegendPages(pdf as jsPDF, legends, {
        drawFrame: false, // sin recuadro
        onAfterPage: (doc: jsPDF) => {
          this.drawCornerPaginationBadge(doc); // badge “N / {total}”
        },
      });
    }

    // Sustituir placeholder “de N”
    (pdf as JsPdfWithTotal).putTotalPages?.(TOTAL_PAGES_EXP);
  }
}
