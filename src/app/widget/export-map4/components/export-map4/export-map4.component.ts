// src/app/shared/components/export-map4/export-map4.component.ts
import {
  Component,
  ViewChild,
  ElementRef,
  OnDestroy,
  OnInit,
  Inject,
  Optional,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/**
 * PrimeNG 20:
 * - tabview fue removido → ahora se usa "tabs"
 * - dropdown fue removido → ahora se usa "select"
 * - floatlabel se importa como módulo (standalone) → FloatLabelModule
 */
import { TabsModule } from 'primeng/tabs';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';

// Nuevo: orquestador genérico para SG
import { MapExportOrchestratorService } from '@app/shared/services/map-export-service/map-export-orchestrator.service';

import {
  PaperOrientation,
  PaperFormat,
  MarginsPt,
} from '@app/shared/Interfaces/export-map/paper-format';
import {
  ExportFormData,
  TemplateId,
  PdfTemplate,
} from '@app/shared/Interfaces/export-map/pdf-template';
import {
  PDF_TEMPLATE_PROVIDERS,
  PDF_TEMPLATES,
} from '@app/shared/pdf/tokens/pdf-template.token';
import { PdfBuilderService } from '@app/shared/pdf/services/pdf-builder-service/pdf-builder.service';
import { environment } from 'environments/environment';
import { MessageModule } from 'primeng/message';

/** Estado de un job de exportación. */
type JobStatus = 'creating' | 'done' | 'error';

/** Estructura de cada trabajo en la bandeja de exportaciones. */
interface PrintJob {
  id: number;
  name: string;
  progress: number;
  status: JobStatus;
  url?: string;
  error?: string;
}

/** Selector A/B de plantilla visible en la UI. */
type TemplateKind = 'A' | 'B';

/**
 * toOrientation()
 * ---------------
 * Pequeño helper para traducir una cadena (de environment) a `PaperOrientation`.
 *
 * @param v Valor textual de orientación: 'horizontal' | 'vertical' | string | undefined
 * @returns `PaperOrientation.Vertical` o `PaperOrientation.Horizontal` (default)
 */
function toOrientation(
  v: 'horizontal' | 'vertical' | string | undefined
): PaperOrientation {
  return v === 'vertical'
    ? PaperOrientation.Vertical
    : PaperOrientation.Horizontal;
}

/**
 * Componente: ExportMap4Component
 * -------------------------------
 * UI de **Salida Gráfica v4** basada en plantillas PDF.
 *
 * Responsabilidades:
 * - Gestiona el **formulario** de exportación (título, autor, grilla, leyenda, orientación).
 * - Permite seleccionar **plantilla** (A/B) que el `PdfBuilderService` resuelve a `TemplateId`.
 * - Orquesta la **generación del PDF** con `MapExportOrchestratorService.exportToPdf`.
 * - Mantiene una **bandeja de trabajos** con barra de progreso y resultados descargables.
 * - Toma **valores por defecto** desde `environment.exportMap` (sin NgRx).
 *
 * Flujo general:
 * 1) Usuario completa formulario y presiona **Exportar**.
 * 2) Se construye `ExportFormData` y se obtiene `TemplateId` real desde la elección A/B.
 * 3) Se invoca el orquestador para renderizar mapa off-screen y construir el PDF.
 * 4) El resultado (blob URL + nombre sugerido) se presenta en la pestaña de descargas.
 *
 * Notas:
 * - Componente **standalone** con módulos PrimeNG y Forms incluidos en `imports`.
 * - Usa un contenedor off-screen (`hiddenMapContainer`) para renderizar el mapa temporal.
 * - Las plantillas PDF se registran dinámicamente a través del token multi `PDF_TEMPLATES`.
 *
 * @author
 *  Sergio Alonso Mariño Duque
 * @date
 *  02-09-2025
 * @version
 *  2.0.0
 */
@Component({
  selector: 'app-export-map4',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TabsModule,
    DialogModule,
    CardModule,
    MessageModule,
    SelectModule,
    InputTextModule,
    ButtonModule,
    FloatLabelModule,
    CheckboxModule,
    ProgressBarModule,
    RadioButtonModule,
  ],
  providers: [...PDF_TEMPLATE_PROVIDERS],
  templateUrl: './export-map4.component.html',
  styleUrls: ['./export-map4.component.scss'],
})
export class ExportMap4Component implements OnInit, OnDestroy {
  /**
   * Contenedor **off-screen** donde el orquestador montará el mapa temporal
   * que luego se rasteriza para el PDF.
   */
  @ViewChild('hiddenMapContainer', { static: false })
  hiddenMapContainer!: ElementRef<HTMLDivElement>;

  readonly MAXLEN = { title: 100, author: 50 };

  /** Índice del Tabs activo (0: formulario, 1: descargas). */
  activeIndex = 0;

  /** Diálogo de selección de plantilla A/B. */
  templateDialogVisible = false;

  /** Plantilla elegida por el usuario (mapeada a `TemplateId`). */
  selectedTemplate: TemplateKind = 'B';

  /** Cola de trabajos con progreso y resultado. */
  printJobs: PrintJob[] = [];

  /** Secuencia incremental para IDs de trabajos. */
  private jobIdSeq = 0;

  /** Timers de progreso “simulado” por job (limpieza en destroy). */
  private jobTimers = new Map<number, number>();

  /** URL de logo institucional (inyectada desde environment). */
  logoUrl = '';

  /** Formulario reactivo principal. */
  exportForm: FormGroup;

  /** Opciones de orientación mostradas en el select. */
  orientationOptions = [
    { label: 'Vertical', value: PaperOrientation.Vertical },
    { label: 'Horizontal', value: PaperOrientation.Horizontal },
  ];

  constructor(
    private fb: FormBuilder,
    private orchestrator: MapExportOrchestratorService,
    private pdfBuilder: PdfBuilderService,
    /** Plantillas registradas (token multi). Si vienen, se inyectan aquí. */
    @Optional() @Inject(PDF_TEMPLATES) private templates: PdfTemplate[] | null
  ) {
    // Inicialización del formulario con validaciones básicas.
    this.exportForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      author: ['', [Validators.required, Validators.maxLength(50)]],
      showGrid: [false],
      includeLegend: [false],
      orientation: [PaperOrientation.Horizontal, Validators.required],
    });
  }

  /**
   * ngOnInit()
   * ----------
   * - Registra plantillas PDF en el `PdfBuilderService` si existen por token.
   * - Carga **defaults** desde `environment.exportMap` y rellena el formulario.
   */
  ngOnInit(): void {
    // Registro dinámico de plantillas (si fueron provistas por el token multi).
    if (this.templates?.length)
      this.pdfBuilder.registerTemplates(...this.templates);

    // === Defaults desde environment (sin NgRx) ===
    const defs = environment.exportMap;
    this.exportForm.patchValue(
      {
        title: defs.title ?? '',
        author: defs.author ?? '',
        showGrid: !!defs.showGrid,
        includeLegend: !!defs.includeLegend,
        orientation: toOrientation(defs.orientation),
      },
      { emitEvent: false }
    );
    this.logoUrl = defs.logoUrl || '';
  }

  /**
   * ngOnDestroy()
   * -------------
   * Limpia timers y descargas para evitar fugas de memoria y handles activos.
   */
  ngOnDestroy(): void {
    this.clearDownloads();
    this.jobTimers.forEach(id => clearInterval(id));
    this.jobTimers.clear();
  }

  /** Maneja cambio de tab (PrimeNG emite string|number|undefined) */
  onTabChange(v: string | number | undefined): void {
    this.activeIndex = typeof v === 'number' ? v : Number(v ?? 0);
  }

  // ===== Acciones de diálogo de plantilla =====

  /** Abre el diálogo de selección de plantilla. */
  openTemplateDialog(): void {
    this.templateDialogVisible = true;
  }

  /** Marca la plantilla seleccionada. */
  selectTemplate(kind: TemplateKind): void {
    this.selectedTemplate = kind;
  }

  /** Confirma la plantilla y cierra el diálogo. */
  applyTemplate(): void {
    this.templateDialogVisible = false;
  }

  // ===== Helpers de UI / validación =====

  campoInvalido(ctrl: string): boolean {
    const c = this.exportForm.get(ctrl);
    return !!(c && c.invalid && (c.touched || c.dirty));
  }

  /** Hay algún job finalizado que pueda limpiarse. */
  get canClearDownloads(): boolean {
    return this.printJobs.some(j => j.status !== 'creating');
  }

  /** TrackBy para *ngFor de trabajos (mejora rendimiento de la lista). */
  trackJob = (_: number, j: PrintJob) => j.id;

  /**
   * clearDownloads()
   * ----------------
   * Revoca URLs de blob de trabajos completados/errados y limpia timers,
   * dejando en la lista solo aquellos que siguen “creating”.
   */
  clearDownloads(): void {
    const toDelete = this.printJobs.filter(j => j.status !== 'creating');
    for (const job of toDelete) {
      if (job.url?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(job.url);
        } catch (e) {
          console.error('error:', e);
        }
      }
      const t = this.jobTimers.get(job.id);
      if (t) {
        clearInterval(t);
        this.jobTimers.delete(job.id);
      }
    }
    this.printJobs = this.printJobs.filter(j => j.status === 'creating');
  }

  /**
   * startProgress(job)
   * ------------------
   * Inicia un **progreso simulado** mientras corre la export real.
   * Baja fricción UX: la barra avanza hasta ~85% y se completa al finalizar.
   *
   * @param job Trabajo que se está procesando.
   */
  private startProgress(job: PrintJob): void {
    const tick = () => {
      const cap = 85;
      const inc = Math.random() * 6 + 2;
      job.progress = Math.min(cap, job.progress + inc);
    };
    tick();
    const intId = window.setInterval(tick, 600);
    this.jobTimers.set(job.id, intId);
  }

  /** Sube el progreso mínimo del job hasta `value`. */
  private step(job: PrintJob, value: number): void {
    job.progress = Math.max(job.progress, value);
  }

  /**
   * finishProgress(job)
   * -------------------
   * Completa el progreso a 100 y limpia el timer asociado.
   */
  private finishProgress(job: PrintJob): void {
    const id = this.jobTimers.get(job.id);
    if (id) {
      clearInterval(id);
      this.jobTimers.delete(job.id);
    }
    job.progress = 100;
  }

  /**
   * templateIdFromKind(kind)
   * ------------------------
   * Traduce la elección A/B a la clave `TemplateId` usada por el builder.
   *
   * @param kind 'A' o 'B'
   * @returns `TemplateId` ('standard' | 'standard-v2')
   */
  private templateIdFromKind(kind: TemplateKind): TemplateId {
    return kind === 'A' ? 'standard' : 'standard-v2';
  }

  // Helper de error legible
  errorMsg(campo: 'title' | 'author'): string | null {
    const control = this.exportForm.get(campo);
    if (!control || !(control.touched || control.dirty)) return null;
    const errors = control.errors;
    if (!errors) return null;

    if (errors['required']) {
      return campo === 'title'
        ? 'El título es obligatorio.'
        : 'El autor es obligatorio.';
    }
    if (errors['maxlength']) {
      const lim = this.MAXLEN[campo];
      return campo === 'title'
        ? `El título debe contener máximo ${lim} caracteres.`
        : `El autor debe contener máximo ${lim} caracteres.`;
    }
    return null;
  }

  /**
   * onSubmit()
   * ----------
   * Valida el formulario, crea un **job** en la bandeja, invoca el orquestador
   * de exportación y actualiza el estado con el resultado (o error).
   */
  async onSubmit(): Promise<void> {
    if (this.exportForm.invalid) {
      this.exportForm.markAllAsTouched();
      return;
    }

    // 1) Normalización de datos
    const raw = this.exportForm.value;
    const formData: ExportFormData = {
      title: raw.title,
      author: raw.author,
      showGrid: !!raw.showGrid,
      includeLegend: !!raw.includeLegend,
      orientation: raw.orientation as PaperOrientation,
      paper: PaperFormat.Letter,
    };

    // 2) Resolver plantilla
    const templateId = this.templateIdFromKind(this.selectedTemplate);

    // 3) Alta del job y arranque de progreso
    const safeName = `${(formData.title || 'documento')
      .trim()
      .replace(/\s+/g, '_')}.pdf`;
    const job: PrintJob = {
      id: ++this.jobIdSeq,
      name: safeName,
      progress: 0,
      status: 'creating',
    };
    this.printJobs.unshift(job);
    this.startProgress(job);

    // 4) UI: ir a pestaña de resultados
    this.activeIndex = 1;

    // 5) Ejecutar export (mapa off-screen → PDF)
    const container = this.hiddenMapContainer.nativeElement;
    const logoUrl = this.logoUrl || '';

    // Márgenes específicos de SG v4 (copiados del orquestador viejo v4)
    const frameMargin = 20;
    const headerSpace = 40;
    const footerTableH = 3 * 20;
    const footerExtra = 10;

    const mapMargins: MarginsPt = {
      top: frameMargin + headerSpace,
      right: frameMargin,
      bottom: frameMargin + footerTableH + footerExtra,
      left: frameMargin,
    };

    try {
      this.step(job, 15);

      const result = await this.orchestrator.exportToPdf(
        container,
        logoUrl,
        formData,
        {
          logPrefix: '[PDF v4-refac]',
          templateId,
          mapMargins,
          gridOptions: {
            expandBy: 5,
            idealCells: 135,
          },
        }
      );

      this.step(job, 90);

      if (!result) {
        job.status = 'error';
        job.error = 'No se pudo generar el PDF.';
        this.finishProgress(job);
        return;
      }

      // 6) Cerrar job con éxito
      job.url = result.url;
      job.name = result.name || job.name;
      job.status = 'done';
      this.finishProgress(job);
    } catch (err: unknown) {
      // 7) Manejo de error general
      job.status = 'error';
      job.error = err instanceof Error ? err.message : String(err);
      this.finishProgress(job);
    }
  }
}
