import { jsPDF } from 'jspdf';
import {
  PaperFormat,
  PaperOrientation,
} from '@app/shared/Interfaces/export-map/paper-format';

/**
 * Tipado común para plantillas PDF del exportador de mapas.
 * ---------------------------------------------------------
 * Define estructuras de datos para:
 * - Posicionamiento del mapa dentro del PDF (en puntos tipográficos).
 * - Entradas de leyenda (nombre + imagen).
 * - Datos del formulario de exportación (título, autor, grilla, etc.).
 * - Argumentos de renderizado que recibe cada plantilla (`PdfTemplate`).
 * - Identificadores de plantilla y contrato que deben implementar.
 *
 * Notas:
 * - Las unidades de posicionamiento del mapa son **puntos** (pt). 1 pt = 1/72 in.
 * - `jsPDF` es el motor de renderizado subyacente en todas las plantillas.
 */

/**
 * Posicionamiento (en puntos) del rectángulo donde se inserta el mapa en el PDF.
 * Útil si una plantilla requiere un layout específico.
 */
export interface MapPlacementPt {
  /** Distancia desde el borde izquierdo de la página (pt). */
  left: number;
  /** Distancia desde el borde superior de la página (pt). */
  top: number;
  /** Ancho disponible para el mapa (pt). */
  widthPt: number;
  /** Alto disponible para el mapa (pt). */
  heightPt: number;
}

/**
 * Entrada de leyenda: par (nombre de capa, imagen PNG/JPEG en DataURL).
 * Cada elemento se imprime centrado en su página/sección de “Leyenda”.
 */
export interface LegendEntry {
  /** Nombre de la capa tal como debe verse en el PDF (encima de la imagen). */
  layerName: string;
  /** Imagen de la leyenda en formato DataURL (`data:image/png;base64,...`). */
  dataUrl: string;
}

/**
 * Datos declarados por el formulario de exportación.
 * Las plantillas los utilizan para títulos, autoría y banderas visuales.
 */
export interface ExportFormData {
  /** Título principal del documento. */
  title: string;
  /** Autor/entidad responsable del documento. */
  author: string;
  /** Si `true`, se muestra una grilla superpuesta en el mapa. */
  showGrid: boolean;
  /** Si `true`, se incluyen páginas de leyenda al final del PDF. */
  includeLegend: boolean;
  /** Orientación del papel (Vertical u Horizontal). */
  orientation: PaperOrientation;
  /** Formato del papel (A4, Letter, etc.). Opcional si la plantilla fija su propio formato. */
  paper?: PaperFormat;
}

/**
 * Identificadores válidos de plantillas disponibles en el sistema.
 * - 'standard': plantilla clásica.
 * - 'standard-v2': plantilla con pie rotulado (título/autor/escala/paginación).
 */
export type TemplateId =
  | 'standard'
  | 'standard-v2'
  | 'standard-v3'
  | 'standard-v4'
  | 'standard-v5';

/**
 * Argumentos que recibe una plantilla al momento de **renderizar**.
 * La orquestación (builder) prepara y pasa estos datos a `render(...)`.
 */
export interface PdfTemplateRenderArgs {
  /** Instancia de `jsPDF` donde la plantilla debe dibujar. */
  pdf: jsPDF;

  /** Datos de formulario (título, autor, flags, orientación). */
  formData: ExportFormData;

  /**
   * Imagen del mapa a incrustar (PNG/JPEG en DataURL).
   * Suele provenir de un canvas off-screen ya rasterizado.
   */
  imgData: string;

  /**
   * Barra de escala gráfica (opcional):
   *  - `dataUrl`: imagen en DataURL para insertar en el PDF.
   *  - `width`/`height`: tamaño nativo (px) usado para escalar en el layout.
   */
  scale: { dataUrl: string; width: number; height: number };

  /**
   * Entradas de leyenda a renderizar (si `includeLegend` es `true`).
   * Cada `LegendEntry` se imprimirá de forma paginada/centrada.
   */
  legends: LegendEntry[];

  /**
   * Logo institucional (opcional). Puede venir `null` si no aplica.
   * Las plantillas que lo soportan lo insertan en su footer/encabezado.
   */
  logoUrl?: string | null;

  /**
   * Configuración de papel efectiva (formato + orientación) con la que
   * se creó el documento `jsPDF`. Útil si la plantilla necesita conocer
   * los parámetros exactos del documento ya inicializado.
   */
  paper: { format: PaperFormat; orientation: PaperOrientation };

  /**
   * Metadatos y/o dimensiones del canvas del mapa usados durante la exportación.
   * - `canvasWidth`/`canvasHeight`: tamaño (px) del raster exportado.
   * - `placement`: caja (en puntos) para ubicar el mapa dentro de la página.
   */
  map?: {
    canvasWidth?: number;
    canvasHeight?: number;
    placement?: MapPlacementPt;
  };

  /**
   * Metadatos de generación del PDF (opcional):
   * - `dpi`: resolución efectiva con la que se generó la imagen del mapa.
   * - `createdAt`: fecha/hora de creación del documento.
   */
  meta?: { dpi: number; createdAt: Date; scaleLabel?: string };
}

/**
 * Contrato mínimo que debe implementar toda plantilla PDF.
 * El builder invoca `render(args)` para permitir a la plantilla
 * dibujar su contenido sobre el `jsPDF` provisto.
 */
export interface PdfTemplate {
  /** Identificador único de la plantilla. */
  readonly id: TemplateId;
  /** Etiqueta visible (para UI/listados). */
  readonly label: string;

  /**
   * Renderiza el contenido en el documento `jsPDF` provisto mediante `args`.
   * La implementación **NO** debe cerrar/descargar el PDF; sólo dibujar.
   *
   * @param args  Argumentos completos de renderizado.
   */
  render(args: PdfTemplateRenderArgs): Promise<void>;
}
