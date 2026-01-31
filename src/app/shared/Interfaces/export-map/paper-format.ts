export interface PaperSpec {
  /** ancho y alto en puntos tipográficos (1pt = 0.0352778cm) */
  w: number;
  h: number;
}

export enum PaperFormat {
  A4 = 'a4',
  Letter = 'letter',
  Legal = 'legal', // “oficio”
}

export enum PaperOrientation {
  Vertical = 'vertical',
  Horizontal = 'horizontal',
}

/** Tabla de tamaños estándar en pt (jsPDF usa pt por defecto) */
export const PAPER_SPECS_PT: Record<PaperFormat, PaperSpec> = {
  [PaperFormat.A4]: { w: 595.28, h: 841.89 },
  [PaperFormat.Letter]: { w: 612, h: 792 },
  [PaperFormat.Legal]: { w: 612, h: 1008 },
};

/** utilidades opcionales */
export const DEFAULT_DPI = 96;
export const ptToPx = (pt: number, dpi = DEFAULT_DPI) =>
  Math.round((pt / 72) * dpi);
export const pxToPt = (px: number, dpi = DEFAULT_DPI) => (px / dpi) * 72;

export interface MarginsPt {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// Convierte el área útil (pt) a px al DPI elegido y devuelve también los pt
export function computeContentSizePx(
  paper: PaperSpec,
  margins: MarginsPt,
  dpi = 180
): { wPx: number; hPx: number; wPt: number; hPt: number } {
  const wPt = paper.w - margins.left - margins.right;
  const hPt = paper.h - margins.top - margins.bottom;
  return { wPx: ptToPx(wPt, dpi), hPx: ptToPx(hPt, dpi), wPt, hPt };
}
