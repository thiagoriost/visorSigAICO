// src/app/shared/pdf/services/templates/standard-v5-pdf-template.service.ts
import { Injectable } from '@angular/core';
import type { jsPDF } from 'jspdf';

import {
  PdfTemplate,
  PdfTemplateRenderArgs,
} from '../../../Interfaces/export-map/pdf-template';
import { PdfCommonService } from '../pdf-common-service/pdf-common.service';

/** Alto del footer estilo */
const LINEA_NEGRA_FOOTER_HEIGHT = 110;

/** Margen general de la página (pt approx.) */
const PAGE_MARGIN = 24;

@Injectable({ providedIn: 'root' })
export class StandardV5PdfTemplateService implements PdfTemplate {
  readonly id = 'standard-v5' as const;
  readonly label = 'Estándar v5 –';

  constructor(private common: PdfCommonService) {}

  // ============================================================
  //  Type guard para detectar getImageProperties sin usar any
  // ============================================================
  private hasGetImageProps(pdfObj: jsPDF): pdfObj is jsPDF & {
    getImageProperties: (
      img: string | HTMLImageElement | HTMLCanvasElement | Uint8Array
    ) => { width: number; height: number };
  } {
    const anyPdf = pdfObj as unknown as Record<string, unknown>;
    return typeof anyPdf['getImageProperties'] === 'function';
  }

  // ============================================================
  //  Dibuja el logo proporcionado SIN deformarlo (sincrónico)
  // ============================================================
  private drawLogoInBox(
    pdf: jsPDF,
    logoData: string,
    x: number,
    y: number,
    w: number,
    h: number
  ): void {
    // Tamaños internos de la caja
    let drawW = w - 12;
    let drawH = h - 12;

    let offsetX = x + (w - drawW) / 2;
    let offsetY = y + (h - drawH) / 2;

    // Si jsPDF soporta getImageProperties → mantener proporción real
    if (this.hasGetImageProps(pdf)) {
      try {
        const props = pdf.getImageProperties(logoData);

        if (props?.width && props?.height) {
          const imgAspect = props.width / props.height;
          const boxAspect = drawW / drawH;

          if (imgAspect > boxAspect) {
            // Imagen más “ancha” que la caja: ajustamos altura
            drawH = drawW / imgAspect;
          } else {
            // Imagen más “alta” que la caja: ajustamos ancho
            drawW = drawH * imgAspect;
          }

          offsetX = x + (w - drawW) / 2;
          offsetY = y + (h - drawH) / 2;
        }
      } catch {
        // Si algo falla, usamos la caja completa con márgenes
        drawW = w - 12;
        drawH = h - 12;
        offsetX = x + (w - drawW) / 2;
        offsetY = y + (h - drawH) / 2;
      }
    }

    pdf.addImage(logoData, 'PNG', offsetX, offsetY, drawW, drawH);
  }

  // ============================================================
  //  Placeholder punteado del logo
  // ============================================================
  private drawLogoPlaceholder(
    pdf: jsPDF,
    x: number,
    y: number,
    w: number,
    h: number
  ): void {
    interface JsPdfWithDash extends jsPDF {
      setLineDash?(pattern: number[], phase?: number): jsPDF;
    }

    const pdfWithDash = pdf as unknown as JsPdfWithDash;

    if (typeof pdfWithDash.setLineDash === 'function') {
      pdfWithDash.setLineDash([3, 3], 0);
    }

    pdf.setDrawColor(80);
    pdf.rect(x, y, w, h);

    if (typeof pdfWithDash.setLineDash === 'function') {
      pdfWithDash.setLineDash([], 0);
    }

    pdf.setFont('helvetica', 'normal').setFontSize(11).setTextColor(80);
    const cx = x + w / 2;
    const cy = y + h / 2;
    pdf.text('Zona', cx, cy - 4, { align: 'center' });
    pdf.text('logo', cx, cy + 10, { align: 'center' });
  }

  // ============================================================
  //  Footer negro del estilo V5 (sincrónico)
  // ============================================================
  private drawLineaNegraFooter(
    pdf: jsPDF,
    args: {
      formData: PdfTemplateRenderArgs['formData'];
      logoData?: string | null;
      scaleLabel?: string;
    }
  ): void {
    const { formData, logoData } = args;

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    const bottomY = pageH - PAGE_MARGIN;
    const topY = bottomY - LINEA_NEGRA_FOOTER_HEIGHT;

    const pageNum =
      (
        pdf as unknown as {
          internal?: { getCurrentPageInfo?: () => { pageNumber: number } };
        }
      ).internal?.getCurrentPageInfo?.().pageNumber ?? 1;

    const folio = String(pageNum).padStart(2, '0');
    const leftMargin = PAGE_MARGIN;
    const lineStartX = leftMargin + 80;

    // Número de página grande
    pdf.setFont('helvetica', 'bold').setFontSize(60).setTextColor(0);
    const numBaseY = topY + LINEA_NEGRA_FOOTER_HEIGHT / 2 + 30;
    pdf.text(folio, leftMargin, numBaseY, { align: 'left' });

    // Caja del logo
    const logoBoxW = 110;
    const logoBoxH = 80;
    const logoX = pageW - PAGE_MARGIN - logoBoxW;
    const logoY = topY + 24;

    if (logoData) {
      try {
        this.drawLogoInBox(pdf, logoData, logoX, logoY, logoBoxW, logoBoxH);
      } catch {
        this.drawLogoPlaceholder(pdf, logoX, logoY, logoBoxW, logoBoxH);
      }
    } else {
      this.drawLogoPlaceholder(pdf, logoX, logoY, logoBoxW, logoBoxH);
    }

    // Texto columnas
    const contentRightLimit = logoX - 16;
    const contentWidth = contentRightLimit - lineStartX;

    const colGap = 24;
    const colWidth = (contentWidth - colGap) / 2;

    const leftColX = lineStartX + 10;
    const rightColX = leftColX + colWidth + colGap;

    // Base ligeramente más alta para mejorar respiración vertical
    const baseY = topY + 24 + 15;

    const drawLabel = (label: string, x: number, y: number, maxW: number) => {
      pdf.setLineWidth(2);
      pdf.setDrawColor(0);
      pdf.line(x, y, x + maxW, y);

      pdf.setFont('helvetica', 'bold').setFontSize(9).setTextColor(0);
      pdf.text(label, x, y + 10);
    };

    const drawValue = (
      value: string | null | undefined,
      x: number,
      y: number,
      maxW: number,
      fontSize = 11
    ) => {
      pdf.setFont('helvetica', 'normal').setFontSize(fontSize).setTextColor(0);
      const rightX = x + maxW;
      pdf.text(value || '-', rightX, y, { align: 'right', maxWidth: maxW });
    };

    // ============================
    //  Columna izquierda: Título / Autor
    //  — Ajuste para 100 caracteres —
    // ============================
    drawLabel('Título', leftColX, baseY, colWidth);
    drawValue(formData.title, leftColX, baseY + 18, colWidth, 9);

    drawLabel('Autor', leftColX, baseY + 44, colWidth);
    drawValue(formData.author, leftColX, baseY + 62, colWidth, 9);

    // ============================
    //  Columna derecha: Fecha / Escala
    // ============================
    drawLabel('Fecha', rightColX, baseY, colWidth);
    const fecha = new Date().toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    drawValue(fecha, rightColX, baseY + 18, colWidth, 9);

    drawLabel('Escala', rightColX, baseY + 44, colWidth);
    drawValue(args.scaleLabel ?? '-', rightColX, baseY + 62, colWidth, 9);
  }

  // ============================================================
  //  Footer simplificado para páginas de leyenda (sincrónico)
  // ============================================================
  private drawLegendFooter(pdf: jsPDF, logoData?: string): void {
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    const bottomY = pageH - PAGE_MARGIN;
    const topY = bottomY - LINEA_NEGRA_FOOTER_HEIGHT;

    const leftMargin = PAGE_MARGIN;

    const pageNum =
      (
        pdf as unknown as {
          internal?: { getCurrentPageInfo?: () => { pageNumber: number } };
        }
      ).internal?.getCurrentPageInfo?.().pageNumber ?? 1;

    const folio = String(pageNum).padStart(2, '0');

    pdf.setFont('helvetica', 'bold').setFontSize(60).setTextColor(0);
    const numBaseY = topY + LINEA_NEGRA_FOOTER_HEIGHT / 2 + 10;
    pdf.text(folio, leftMargin, numBaseY, { align: 'left' });

    const logoBoxW = 110;
    const logoBoxH = 80;
    const logoX = pageW - PAGE_MARGIN - logoBoxW;
    const logoY = topY + 24;

    if (logoData) {
      try {
        this.drawLogoInBox(pdf, logoData, logoX, logoY, logoBoxW, logoBoxH);
      } catch {
        this.drawLogoPlaceholder(pdf, logoX, logoY, logoBoxW, logoBoxH);
      }
    } else {
      this.drawLogoPlaceholder(pdf, logoX, logoY, logoBoxW, logoBoxH);
    }
  }

  // ============================================================
  //  Render principal
  // ============================================================
  async render(args: PdfTemplateRenderArgs): Promise<void> {
    const { pdf, formData, imgData, scale, legends, logoUrl, map, meta } = args;

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    const topReserved = PAGE_MARGIN;
    const bottomReserved = LINEA_NEGRA_FOOTER_HEIGHT + PAGE_MARGIN / 2;

    // 1) Cargamos el logo UNA sola vez
    let logoData: string | null = null;
    if (logoUrl) {
      try {
        logoData = await this.common.loadImageAsDataURL(logoUrl);
      } catch {
        logoData = null;
      }
    }

    // 2) Cálculo de área del mapa
    let imgX: number;
    let imgY: number;
    let imgW: number;
    let imgH: number;

    if (map?.placement) {
      const p = map.placement;
      imgX = p.left;
      imgY = p.top - 40;
      imgW = p.widthPt;
      imgH = p.heightPt;
    } else {
      const contentWidth = pageW - 2 * PAGE_MARGIN;
      const availableH = pageH - topReserved - bottomReserved;

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
      imgY = topReserved + 100;
    }

    // 4) Imagen del mapa
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgW, imgH);

    // 5) Barra de escala (esquina inferior-izquierda del mapa)
    if (scale?.dataUrl && scale.width && scale.height) {
      const factorEscala = 0.3;
      const sW = scale.width * 0.75 * factorEscala;
      const sH = scale.height * 0.75 * factorEscala;

      const ypad = 0;
      const xpad = 3;
      const sX = imgX - xpad;
      const sY = imgY + imgH - sH + ypad;
      pdf.addImage(scale.dataUrl, 'PNG', sX, sY, sW, sH);
    }

    // 6) Footer principal (primera página)
    this.drawLineaNegraFooter(pdf, {
      formData,
      logoData,
      scaleLabel: meta?.scaleLabel,
    });

    // 7) Páginas de leyenda
    if (formData.includeLegend && legends?.length) {
      const logoDataForLegend = logoData ?? undefined;
      await this.common.addLegendPages(pdf as jsPDF, legends, {
        drawFrame: false,
        onAfterPage: (doc: jsPDF) => {
          this.drawLegendFooter(doc, logoDataForLegend);
        },
      });
    }
  }
}
