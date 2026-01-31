import { Inject, Injectable, Optional } from '@angular/core';
import { jsPDF } from 'jspdf';
import { PDF_TEMPLATES } from '../../tokens/pdf-template.token';
import {
  ExportFormData,
  LegendEntry,
  MapPlacementPt,
  PdfTemplate,
  TemplateId,
} from '../../../Interfaces/export-map/pdf-template';
import {
  PaperFormat,
  PaperOrientation,
} from '@app/shared/Interfaces/export-map/paper-format';

export interface BuildArgs {
  formData: ExportFormData;
  imgData: string;
  scale: { dataUrl: string; width: number; height: number };
  legends: LegendEntry[];
  logoUrl?: string | null;
  templateId: TemplateId;
  paper: { format: PaperFormat; orientation: PaperOrientation };
  map?: {
    canvasWidth?: number;
    canvasHeight?: number;
    placement?: MapPlacementPt;
  };
  meta?: {
    dpi: number;
    createdAt: Date;
    scaleLabel?: string;
  };
}

/**
 * Servicio **constructor de PDFs** basado en **plantillas**: `PdfBuilderService`
 * -------------------------------------------------------------------------------
 * Responsable de:
 * - Mantener un **registro de plantillas** (`PdfTemplate`) que pueden llegar por:
 *   - Inyección mediante token multi-provider (`PDF_TEMPLATES`), o
 *   - Registro en tiempo de ejecución vía `registerTemplates(...)`.
 * - Seleccionar la plantilla (`getTemplate`) con **fallback** seguro si el `id` no existe.
 * - Instanciar `jsPDF` con el **papel** y **orientación** correctos, y delegar el
 *   **render** del contenido a la plantilla elegida.
 * - Devolver `{ url, name, pdf }`, donde `url` es un `ObjectURL` listo para descarga.
 *
 * Notas de uso:
 * - Quien consuma `build()` es responsable de **revocar** el `ObjectURL` cuando el
 *   archivo ya no se necesite (`URL.revokeObjectURL(url)`).
 * - Si no hay plantillas registradas, `getTemplate` lanzará un **Error** explícito
 *   con instrucciones para registrar.
 *
 * @author
 *  Sergio Alonso Mariño Duque
 * @date
 *  02-09-2025
 * @version
 *  1.0.0
 */
@Injectable({ providedIn: 'root' })
export class PdfBuilderService {
  private registry = new Map<string, PdfTemplate>();

  constructor(
    /** Plantillas opcionales inyectadas vía token multi-provider. */
    @Optional() @Inject(PDF_TEMPLATES) templates: PdfTemplate[] | null
  ) {
    // Si llegan vía token (registro global), también se incorporan al registro local.
    if (templates?.length) this.registerTemplates(...templates);
  }

  /**
   * registerTemplates(...templates)
   * -------------------------------
   * Registra plantillas en **tiempo de ejecución**.
   * Útil si este builder vive dentro de un componente standalone que decide
   * qué plantillas activar sin tocar el bootstrap global.
   *
   * - Si una plantilla con el mismo `id` ya existe, se **reemplaza**.
   * - Plantillas sin `id` definido se **ignoran** silenciosamente.
   *
   * @param templates Lista de plantillas a registrar.
   */
  registerTemplates(...templates: PdfTemplate[]) {
    for (const t of templates) {
      if (!t?.id) continue;
      this.registry.set(t.id, t);
    }
  }

  /**
   * getAvailableTemplates()
   * -----------------------
   * Devuelve un listado ligero de plantillas disponibles para poblar un selector UI.
   *
   * @returns Arreglo de `{ id, label }`.
   */
  getAvailableTemplates(): { id: string; label: string }[] {
    return Array.from(this.registry.values()).map(t => ({
      id: t.id,
      label: t.label,
    }));
  }

  /**
   * getTemplate(id)
   * ---------------
   * Recupera la plantilla por `id`. Si no existe:
   * - Si **hay** al menos una plantilla registrada, usa la **primera** como fallback,
   *   registrando un `console.warn` para diagnóstico.
   * - Si **no** hay plantillas, lanza un `Error` con una guía de solución.
   *
   * @param id Identificador de plantilla solicitada.
   * @throws Error si no hay ninguna plantilla registrada.
   */
  private getTemplate(id: TemplateId): PdfTemplate {
    const tpl = this.registry.get(id);
    if (tpl) return tpl;

    // Fallback seguro si el id no existe pero el registro no está vacío.
    const first = this.registry.values().next().value as
      | PdfTemplate
      | undefined;
    if (first) {
      console.warn(
        `[PDF] Template "${id}" no registrado. Usando fallback "${first.id}".`
      );
      return first;
    }
    throw new Error(
      '[PDF] No hay plantillas registradas. ' +
        'Registra globalmente con PDF_TEMPLATE_PROVIDERS en el bootstrap, ' +
        'o llama a PdfBuilderService.registerTemplates(...) desde tu componente.'
    );
  }

  /**
   * build(args)
   * -----------
   * Construye el documento PDF usando la plantilla elegida y devuelve:
   * - `url`: ObjectURL listo para descarga/preview.
   * - `name`: nombre de archivo sugerido (sanitizado).
   * - `pdf`: instancia `jsPDF` por si necesitas post-procesar (agregar páginas, etc.).
   *
   * Flujo:
   * 1) Configura `jsPDF` según papel/orientación.
   * 2) Busca la plantilla (`getTemplate`) y ejecuta `render(...)`.
   * 3) Serializa el PDF y expone un `ObjectURL` + nombre.
   *
   * @param args Parámetros completos para la plantilla (ver `BuildArgs`).
   * @returns `{ url, name, pdf }` para uso en UI. El consumidor debe revocar el `url` cuando corresponda.
   */
  async build(
    args: BuildArgs
  ): Promise<{ url: string; name: string; pdf: jsPDF }> {
    const toJsPdfOrientation = (o: PaperOrientation) =>
      o === PaperOrientation.Horizontal ? 'landscape' : 'portrait';

    const pdf = new jsPDF({
      orientation: toJsPdfOrientation(args.paper.orientation),
      unit: 'pt',
      format: args.paper.format,
    });

    await this.getTemplate(args.templateId).render({
      pdf,
      formData: args.formData,
      imgData: args.imgData,
      scale: args.scale,
      legends: args.legends,
      logoUrl: args.logoUrl ?? null,
      paper: args.paper,
      map: args.map,
      meta: args.meta,
    });

    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    const safeBase = (args.formData.title || 'documento')
      .trim()
      .replace(/\s+/g, '_');
    const name = `${safeBase}.pdf`;
    return { url, name, pdf };
  }
}
